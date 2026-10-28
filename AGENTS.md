# 開発エージェント向けガイド

このファイルはリポジトリ全体に適用します。

## プロジェクト構成

iQbe はクイズの作成・学習・分析を行う TypeScript の pnpm モノレポです。

- `packages/frontend`: React、Vite、Mantine、TanStack Router を使用する UI。
- `packages/backend`: Hono による API。`src/app.ts` がアプリ定義、`src/index.ts` が起動処理。
- `packages/backend/src/applications/usecases`: アプリケーションのユースケース。
- `packages/backend/src/domains`: ドメインのロジックとリポジトリインターフェース。
- `packages/backend/src/interfaces`: HTTP コントローラーとインフラ実装。
- `packages/backend/prisma`: DB スキーマとマイグレーション。Prisma は主にスキーマ管理・型生成に使用し、DB アクセスは既存の Kysely 等の実装に従う。
- `scripts`: ビルド・クリーン等の共通スクリプト。

## 開発コマンド

リポジトリルートで実行します。パッケージマネージャーは pnpm を使用し、バージョンはルート `package.json` の `packageManager` に従ってください。

| コマンド                                 | 用途                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`         | ロックファイルに従った依存関係の導入                                 |
| `pnpm dev`                               | バックエンドとフロントエンドの開発サーバー起動                       |
| `pnpm typecheck`                         | バックエンドのビルドとフロントエンドの型検査                         |
| `pnpm test`                              | 両パッケージの通常テスト                                             |
| `pnpm lint`                              | Oxlint による静的解析                                                |
| `pnpm lint:fix`                          | Oxlint による自動修正                                                |
| `pnpm fmt`                               | Oxfmt による整形                                                     |
| `pnpm fmt:check`                         | Oxfmt による書式検査                                                 |
| `pnpm --filter backend test`             | バックエンドの Vitest テスト                                         |
| `pnpm --filter frontend test`            | フロントエンドの Vitest テスト                                       |
| `pnpm build`                             | バックエンド、フロントエンドの順にビルドし、静的ファイルを組み立てる |
| `pnpm --filter frontend routes:generate` | フロントエンドのルート定義を生成                                     |

`dev`・`build`・`start`・ルートのマイグレーションコマンドは `.config/.env` を読み込みます。必要な設定はコードと既存の構成を確認し、実際の秘密情報をドキュメントやログへ出力しないでください。

## 実装方針

- 変更対象周辺の実装とテストを読み、既存の責務分割と命名に合わせる。
- HTTP 入力のスキーマは各コントローラーに隣接する `schema.ts` に置き、ルートとコントローラーで共有する。共通パーサーは `src/http/parsers.ts`、ドメインの制約は `src/domains` に置く。
- コントローラーへ直接 DB 処理を追加せず、ユースケースとリポジトリへ委譲する。
- API 契約は Hono のルート定義を基準とする。フロントエンドは `backend/rpc` の `AppType` と `hono/client` の `hc<AppType>` からリクエスト・レスポンス型を推論する。API 変更時は両パッケージへの影響を確認する。
- フロントエンドのルート変更は `src/routes` で行う。生成物 `src/routeTree.gen.ts` を直接編集しない。
- `packages/backend/src/db/types.ts` は Prisma スキーマから生成されるため、型の変更はスキーマと生成手順から行う。`dist` や `node_modules` を直接修正しない。
- 静的解析は Oxlint、整形は Oxfmt を使用し、ルートの `.oxlintrc.json` と `.oxfmtrc.json` に従う。インデントはスペース 2 個、改行は LF、JavaScript / TypeScript の文字列はダブルクォートを使用する。フォーマットは変更したファイルに限定する。
- 依存関係を変更した場合は `pnpm-lock.yaml` を整合させる。既存の `pnpm-workspace.yaml` の overrides を理由なく削除しない。

## 検証

- 振る舞いを変更した場合は、関連する既存テストを実行し、必要に応じて回帰テストを追加する。テストは主に `src/**/*.test.ts` に配置されている。
- API や共有型を変更した場合は `pnpm typecheck` を実行する。ビルドや配信構成を変更した場合は `pnpm build` も確認する。
- 現行のテストランナーは Vitest。古いドキュメントにある Jest 専用オプションは使用せず、各 `package.json` と Vitest 設定を確認する。
- MySQL 統合テストは Docker が利用できる環境で `pnpm --filter backend test:integration` を実行する。専用の一時コンテナを使用し、通常テストとは分離されている。詳細は `packages/backend/README.md` を参照する。
- 実行した検証と結果を報告する。環境の制約で実行できなかった場合は、その理由を明記する。

## DB と既存の変更

- DB の変更にはマイグレーションを追加し、適用済みの移行 SQL を書き換えない。実データへの適用はコード変更と分けて扱う。
- `migrate:reset` はデータを削除するため、対象と明示的な指示を確認せず実行しない。
- 分析 API の期間境界は日本時間を基準とする。既存 DATETIME データとの互換性を保つため、DB 接続や保存時の時刻設定を安易に変更しない。
- 作業開始時に `git status` を確認し、既存の未コミット変更を保持する。依頼と無関係な変更の取り消しや整形は行わない。
