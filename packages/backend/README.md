# iqbe-api

## 概要
iQbeのコアAPI群．

## 構成
Clean Architecter をベースとした軽量DDD．
- 値オブジェクトを作成しない
- 
### Prisma
- TypeScriptのORMである[Prisma](https://www.prisma.io/)のスキーマ定義ファイル`prisma/schema.prisma`とマイグレーションファイル群から成る
- 本APIではORMとしてではなく，マイグレーション用でPrismaを用いている

### src/interfaces/controllers
- controller ごとにディレクトリを分け、`Quiz/QuizController.ts` と `Quiz/schema.ts` のようにハンドラーと HTTP 入力スキーマを隣接させます。
- routes と controller は同じ `schema.ts` を参照します。共通の HTTP パーサーは `src/http/parsers.ts`、ドメインの入力制約は `src/domains` に配置します。
- controller を持たない分析 API の入力スキーマは `src/routes/analysis/schema.ts` に配置します。
- DB 処理は controller へ直接記述せず、ユースケースやリポジトリに委譲します。

### src/db
- クエリビルダーである[kysely](https://kysely.dev/)の型定義ファイル
- [prisma-kysely](https://github.com/valtyr/prisma-kysely)によって，prismaスキーマ定義ファイル`prisma/schema.prisma`から自動生成される

### src/middleware
- `src/app.ts` で登録する Hono ミドルウェアを定義

### src/models
- データベースと通信して，データを取得する
- それ単体でテストが可能なモジュールと定義

### src/plugins
### src/routes
### src/services
- 適宜，`src/models`を用いたり，データベースと通信したりして，データを取得・加工する
- `src/models`のテストが終わったらテスト可能なモジュールと定義
- トランザクション処理もここで行う

### src/types

### src/utils
- DB処理に依らない再利用可能な処理を記述

## Testing
Jest を使ってユースケースと Hono HTTP API の回帰テストを実行します。HTTP テストは依存先を差し替え、実際の DB 接続を必要としません。

```
pnpm --filter backend test
```

サーバー起動は `src/index.ts`、アプリ構築と RPC 型の公開は `src/app.ts` で行います。

## API検索・更新の仕様

- クイズ一覧と件数は、自分が作成したクイズを同じ条件で検索します。タグ・カテゴリ・お気に入り・マイリスト・正解率を併用できます。
- 判定と期間は、認証ユーザーの各クイズの最新履歴が基準です。期間内の古い履歴に一致していても、最新履歴が期間外なら対象に含めません。履歴のないクイズは判定 `3`（未解答）として検索できます。
- 一覧はクイズ単位で返します。通常はIDの降順、期間指定時は最新解答日時の降順です。件数APIのレスポンスは従来の `{ size }` を維持します。
- 一括登録は1〜1,000件を受け付け、クイズ・新規タグ・タグ関連を1つのトランザクションで保存します。1件でも失敗すると全件取り消します。問題集は自分の所有するものに限定します。
- `page` は1以上、`maxView` は1〜100（既定値100）、ランキング件数は1〜100（既定値5）です。質問は2,048文字、回答・別解は256文字、タグは128文字・1問100個までです。
- JSON、CSV、プロフィール画像を含むAPIリクエスト本文の上限は5MiBです。multipartのヘッダー等も上限に含みます。
- 未定義APIは404、DB障害は500、入力不正は400、過大な本文は413の共通JSONエラーを返します。クイズ削除には所有者確認が必要です。

分析APIは日本時間で日・週・月の境界を計算し、開始日時以上・次の期間の開始日時未満で集計します。履歴のない期間も含めて7期間を返します。DBパラメーターは履歴INSERTと同じmysql2のDate変換を使い、既存DATETIME値は書き換えません。アプリのタイムゾーン／DB接続の時刻設定は既存データ保存時の設定を維持してください。

## MySQL統合テストと性能比較

Dockerが利用できる環境で実行します。テスト専用のMySQL 9.1コンテナを作成し、終了時に破棄します。設定済みの開発DBには書き込みません。

```bash
pnpm --filter backend test:integration
pnpm --filter backend test:benchmark
```

通常の `test` はDockerを必要とせず、統合テストは明示実行時のみ有効になります。Docker外のコンテナから実行する場合は、必要に応じて `TESTCONTAINERS_HOST_OVERRIDE` を設定してください。

ベンチマークは同一データに対して旧方式と新方式を実行し、3回のウォームアップ後に20回測定します。結果と実行計画はシステム一時ディレクトリの `iqbe-api-benchmark.json` に出力します。測定条件と結果の例は [API_PERFORMANCE.md](API_PERFORMANCE.md) を参照してください。

## インデックス移行

対象は `20261026000000_api_query_indexes` です。`qid`・`wid`・`mid` の一意制約と、履歴の `(user_id, practiced)`・`(practiced, user_id)` を追加します。

まず対象環境の設定で、読み取り専用の事前検査を実行します。

```bash
pnpm exec env-cmd -f .config/.env pnpm --filter backend indexes:check
```

空のID、重複ID、既存インデックスの定義を出力します。空・重複IDがあると失敗終了し、IDを自動生成・変更しません。既に同等のインデックスを手動追加している環境では、適用前に移行履歴と定義を整合させてください。

書き込みを停止した状態で、既存のマイグレーション運用に従って適用します。

```bash
pnpm exec env-cmd -f .config/.env pnpm --filter backend exec prisma migrate deploy
```

移行SQL自身も全IDの検査を行い、不整合があればインデックスDDLを実行する前に停止します。この検査用プロシージャの作成・削除権限が必要です。失敗時は原因を修正してPrismaの失敗した移行を解消し、再適用してください。既存データへの移行適用は、実装・テストとは別の作業です。
