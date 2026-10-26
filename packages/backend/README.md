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

### src/controllers
- 各エンドポイントに渡すコントローラを定義する
- 各エンドポイントとコントローラは1対1で対応する
- 適宜，`src/models`や，`src/services`を用いてレスポンスデータを作成
- `src/contollers`においてDB処理は書いてはならない

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