# Prisma 7 でインデックス移行の統合テストが P3017 で失敗する

> GitHub Issue: [#318](https://github.com/woodnx/iQbe/issues/318)

## 概要

`pnpm --filter backend test:integration` で、次のテストだけが失敗する。他の統合テスト（68 件）は成功する。

- `src/api.integration.test.ts` > MySQL API integration > **refuses invalid IDs before index DDL and applies the migration through Prisma**

```text
Error: Command failed: node node_modules/prisma/build/index.js migrate resolve --applied 0_test_baseline --schema /tmp/iqbe-migration-XXXXXX/schema.prisma
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from ../../../tmp/iqbe-migration-XXXXXX/schema.prisma.
Error: P3017

The migration 0_test_baseline could not be found. Please make sure that the migration exists, and that you included the whole name of the directory.
```

テストの前半（不正な ID があると、移行 SQL がインデックスを作る前に止まること）は成功しており、失敗するのは後半の「Prisma の `migrate deploy` で移行を適用できること」の部分。アプリ本体や本番のマイグレーションの不具合ではなく、テストの組み立て方の問題と考えている。

## 再現手順

Docker が使える環境で、リポジトリルートから実行する。

```bash
pnpm --filter backend test:integration
```

確認環境: `prisma` 7.10.1、MySQL 9.1（Testcontainers）。ブランチ `woodnx/issue14` で確認した。

## 原因（推定）

テストは一時ディレクトリに `schema.prisma` と `migrations/`（`0_test_baseline` と `20261026000000_api_query_indexes`）を作り、`--schema <一時ディレクトリ>/schema.prisma` を付けて `prisma migrate resolve` と `migrate deploy` を実行している。Prisma 6 までは、マイグレーションの置き場所を `--schema` で指定したファイルの隣の `migrations/` から探していた。

Prisma 7 では、作業ディレクトリ（`packages/backend`）の `prisma.config.ts` が自動で読み込まれる。その中の `migrations.path: "prisma/migrations"` が使われるので、一時ディレクトリの `migrations/` は見られず、本物の `prisma/migrations` から `0_test_baseline` を探して見つからない、と考えている。

根拠:

- 出力の 1 行目が `Loaded Prisma config from prisma.config.ts.` で、スキーマだけが一時ディレクトリから読まれている。
- このテストは `ed80658`（2026-10-26）で追加され、`prisma.config.ts` を含む Prisma 7 への更新は `0682469`（2026-11-10）で入った。更新の前は通っていたはず。
- `prisma.config.ts` も、このテストの該当部分も、Issue #314 の作業では変更していない（#314 の変更とは無関係）。

DB に接続できないと Prisma は移行ファイルを探す前に P1001 で止まるため、上の推定は MySQL のある環境ではまだ確かめていない。

## 修正案

一時ディレクトリにテスト専用の Prisma 設定ファイルを作り、`--schema` の代わりに `--config` で渡す。

```ts
// 一時ディレクトリでは prisma/config を import できないので、素のオブジェクトを書く。
const schemaPath = JSON.stringify(path.join(dir, "schema.prisma"));
const migrationsPath = JSON.stringify(path.join(dir, "migrations"));
await writeFile(
  path.join(dir, "prisma.config.ts"),
  `export default {
  schema: ${schemaPath},
  migrations: { path: ${migrationsPath} },
  datasource: { url: process.env.DATABASE_URL },
};
`,
);
// migrate resolve / migrate deploy の両方で:
//   [...prisma, "resolve", "--applied", "0_test_baseline", "--config", path.join(dir, "prisma.config.ts")]
//   [...prisma, "deploy", "--config", path.join(dir, "prisma.config.ts")]
```

確認済みのこと（DB なし）:

- 一時ディレクトリに置いた、import の無い設定ファイルを `--config` で渡すと、Prisma はその設定とスキーマを読み込む（`Loaded Prisma config from <一時ディレクトリ>/prisma.config.ts`）。
- `import { defineConfig } from "prisma/config"` を書くと、一時ディレクトリからはモジュールを解決できず読み込みに失敗する。

代替案: 作業ディレクトリ（`cwd`）を一時ディレクトリにして実行する。ただし Prisma 7 はデータベースの URL を設定ファイルから読むため、結局は一時ディレクトリに設定ファイルが要る。

## 受入条件

- `pnpm --filter backend test:integration` がすべて成功する（このテストを含む）。
- テストが本物の `prisma/migrations` や `_prisma_migrations` の内容に依存しない（一時ディレクトリの移行だけを使う）。
- `packages/backend/prisma.config.ts` とアプリのマイグレーション運用（`migrate:deploy`、`entrypoint.sh`）は変えない。

## 対象外

- `20261026000000_api_query_indexes` の移行 SQL そのものの変更（適用済みの移行 SQL は書き換えない）。
- Prisma のバージョンの変更。
