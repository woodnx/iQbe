# iQbe 学習体験刷新 — Codex引き継ぎドキュメント

> **2026-11-13 仕様更新**: ユーザーの依頼により、#3からFSRSを導入する。当日は不正解・スルーを正解するまで再出題し、全問正解を完了条件とする。定着推定は「評価時点から30日後の想起確率90%以上」を基準とする。本文中の固定間隔・連続3回正解・FSRSを後続にする案は更新済み。実装範囲と後続PRへの引き継ぎは [復習スケジューラ仕様](review_scheduler.md) を参照。

> **対象**: [`woodnx/iQbe`](https://github.com/woodnx/iQbe)  
> **作成日**: 2026-11-06（JST）  
> **文書の性格**: 設計・実装計画の引き継ぎ資料。記載された新API・DBテーブルは、特に断りのない限り**未実装の提案**。  
> **重要**: この文書は、過去の会話と当時のリポジトリ調査結果を統合したもの。Codexは**作業開始時に現在の `main` と `AGENTS.md` を必ず再確認**すること。ユーザーの依頼なく本番DBへのマイグレーション、既存データ削除、PRのマージ・デプロイを行わない。

## 0. Codexへの要約

iQbeは、競技クイズの学習を「楽しく、効果的に、継続できる」ようにするWebアプリ。現行の検索・演習・履歴・問題集・分析機能を維持したまま、**知識を獲得・定着させること自体をゲームの進行と達成感に結び付ける**。

今回の初期スコープは、(1)問題ごとの習熟状態、(2)期限に基づく復習、(3)サーバーで一元管理する「今日の5問」、(4)成長指標、(5)それに連動した控えめな演出、(6)安全な再送・端末間同期。バッジ・ランキング拡張・ジャンル自動分類・早押し詳細分析は後続フェーズ。

**もっとも強いユーザー要件**: 「今日の5問」をDexieだけで生成・保持してはいけない。**同一アカウントの全端末で、当日同じ5問・同じ出題順・同じ進捗**を共有すること。サーバーDBを唯一の正とし、Dexieはキャッシュ／オフラインキューに限定する。

**進め方**: まず現状確認と設計差分を説明し、PRを小さく分割する。**実装を一括で進めず、1PRずつ設計→テスト→実装→検証→レビュー**の形にする。AIが書いた内容について開発者自身が理解できる説明を重視する。

## 1. 狙い・体験コンセプト

### 1.1 プロダクト目標

- **知る喜び**: 新しい知識に出会える。
- **成長の実感**: 昨日できなかった問題が今日できることを明確に示す。
- **続けたくなる体験**: 数問でも達成感を得られ、日々再訪しやすい。
- 学習量やポイントの最大化ではなく、**知識の定着と上達を主役**にする。

### 1.2 4本柱

| 柱 | 役割 | 例 |
| --- | --- | --- |
| Play | 解く楽しさ | 今日の5問、自由演習 |
| Learn | 定着支援 | スマート復習、苦手問題 |
| Grow | 上達の可視化 | 復習成功、定着推定、推移 |
| Achieve | 成果の演出 | 初正解、リベンジ成功、セット完了 |

中心ループ: **出題 → 解答 → 履歴・習熟状態更新 → 後日の復習 → 上達イベント → 成長レポート → 次の学習**。

### 1.3 やらないこと・避けること

- 既存の検索／演習機能の全面リプレイス。
- すべての解答に派手な演出を付けること。
- 連続学習日数を過度に重視して、休んだユーザーに罪悪感を与えること。
- 1回正解しただけで「完全習得」と判定すること。
- 端末ごとに異なる「今日の5問」を作ること。
- 既存の `learning` という曖昧な上位パスに、あらゆる機能を集約すること。

## 2. リポジトリの現状（以前の調査時点）

以下は会話中にGitHubの `woodnx/iQbe` の `main` で確認した内容。**現在も同じとは限らないため再確認すること。**

| 項目 | 既存実装／参考ファイル |
| --- | --- |
| フロント | React / Vite / Mantine / TanStack Router / TanStack Query — `packages/frontend` |
| API | Hono + TypeScript — `packages/backend/src/app.ts`, `src/routes` |
| DB | MySQL、Kysely、Prismaは主にマイグレーションと型生成 — `packages/backend/prisma/schema.prisma` |
| API型連携 | Hono RPC `AppType` + `hc<AppType>` — `packages/frontend/src/utils/client.ts` |
| 設計規約 | 軽量DDD/Clean Architecture — `AGENTS.md`, `packages/backend/README.md` |
| 演習記録 | `POST /api/practice` — `src/routes/practice.ts`, `src/interfaces/controllers/Practice/` |
| 問題検索 | `GET /api/quizzes`, `/size`, `/by-ids` — `src/routes/quizzes.ts` |
| 解答履歴 | `histories` — `schema.prisma`, `src/interfaces/infra/HistoryInfra.ts` |
| 分析 | `GET /api/analysis/status/:date/:period`, ランキング — `src/routes/analysis.ts` |
| 演習再開 | Dexieの `practiceSessions` — `packages/frontend/src/plugins/db.ts`、`routes/practice.tsx` |
| 演習進行 | `packages/frontend/src/features/practice/components/PracticeSceneChanger.tsx` |
| 既存UI | `pages/home.tsx`, `routes/training.tsx`, `features/activity/components/ActivityStatus.tsx` |

### 2.1 既存のAPIと使い道

- `GET /api/quizzes`: 問題集・タグ・カテゴリ・正誤・期間などで絞り込み可能。自由演習を維持。
- `GET /api/quizzes/size`: 検索対象件数。
- `GET /api/quizzes/by-ids?qids=...`: 指定IDの問題を指定順に返す。日替わりセットと保存済み出題順を再利用可能。調査時点では**自分が作成した問題**に限定する仕様だったため、将来問題共有の方針に変更があればアクセス条件を再確認する。
- `POST /api/practice`: 現状は `{ qid, judgement, pressedWord }` を受け、履歴を記録して本文なしの200を返す。`judgement` は **0=不正解、1=正解、2=スルー**。検索での 3=未解答は保存判定と混同しない。
- `GET /api/histories` および期間別集計、`GET /api/analysis/status/:date/:period`: 既存の学習量グラフ等に再利用する。
- `/api/mylists`: コレクションに再利用する。

### 2.2 技術的な注意点

1. `histories` の主キーは `(user_id, quiz_id, practiced)`。`practiced` が `DATETIME(0)` のため、同一秒内の同一問題への複数記録が衝突し得る。**新しい独立IDの追加や移行戦略を先に検討**する。
2. `PracticeSceneChanger.tsx` は解答登録に `mutate()` を使い、書込み成功を待たずに次の問題へ進む。結果表示と同期を正しく扱うため、送信・再送・失敗時のUXを再設計する。
3. Dexieは現在、`quizIds/currentIndex/updatedAt` 等の演習再開情報のみを管理する。**今日の5問の正本にはしない**。
4. `HistoryServise.ts`（現行のファイル名）など既存の実装と責務分割を調査する。`pressedWordPosition || null` のように `0` が `null` に変わる可能性のある箇所も確認する。
5. `QuizInfra` に新規の復習ロジックを直接積み込まず、専用ドメイン・ユースケース・クエリサービスに分離する。
6. 分析の日・週・月の境界はJST前提。既存DATETIMEとの互換性を守り、DBの時刻設定を不用意に変更しない。
7. 現在の本番・開発環境を混同しない。DBマイグレーションは新規ファイルで行い、適用済みSQLを書き換えない。

## 3. 境界とAPIの命名

`practice` と `learning` の区別が曖昧だったため、**APIをリソースごとに分ける**方針に修正した。

| リソース | 責務 | 備考 |
| --- | --- | --- |
| `practice` | **解答という行為の記録** | 既存APIを拡張。互換性優先 |
| `daily-sets` | **日付に紐付く確定した問題セットと進捗** | サーバーが正本 |
| `reviews` | **復習期限に基づく問題選択** | 習熟状態を参照 |
| `analysis` | **学習履歴からの集計・可視化** | 既存分析を拡張 |

新設する `GET /api/learning/queue` のような曖昧なAPIは採用しない。`/api/analysis/learning/summary` の `learning` は分析の種類を表すサブパスとしてのみ使用する。

## 4. MVPのAPI仕様（提案。実装前に契約を確定）

### 4.1 `POST /api/practice` — 既存拡張

既存の `{ qid, judgement, pressedWord }` を壊さず、任意で以下を受ける設計を提案する。

```json
{
  "qid": "quiz-001",
  "judgement": 1,
  "pressedWord": -1,
  "clientAttemptId": "09b0a8f5-6386-4c9e-a0e1-62735040eef3",
  "dailySetItemId": "12345"
}
```

- `clientAttemptId`: 一度の解答を一意に識別するキー。同じキーによる再送は**副作用を重複させない**。UUID等を想定。既存クライアント対応のため段階移行が必要。
- `dailySetItemId`: 今日の5問への解答であることを明示する任意フィールド。対象ユーザーのセットと問題IDの一致を検証。自由演習で同じ問題を解いても当日の進捗は自動更新しない。
- 既存 `judgement=0/1/2` は維持。「曖昧」は将来 `confidence` 等の別属性で表し、検索用の未回答値 `3` と混同しない。
- 認証済みユーザーIDはサーバー側の認証コンテキストから取得。ユーザーIDはリクエストBodyで信用しない。
- 解答履歴追加・習熟状態更新・該当daily item進捗更新・イベント確定を**1トランザクション**で行う。

提案レスポンス例:

```json
{
  "attempt": { "id": "98765", "judgement": 1, "previousJudgement": 0 },
  "review": { "state": "reviewing", "nextReviewAt": "2026-11-08T09:00:00+09:00" },
  "events": [{ "type": "REVENGE_SUCCESS" }],
  "dailySet": { "itemCompleted": true, "completed": 3, "total": 5 }
}
```

**イベント定義（初期）**: `FIRST_CORRECT`, `REVENGE_SUCCESS`, `REVIEW_SUCCESS`。イベント判定はサーバー／ドメインで行い、アニメーションはフロントで表現。イベントは再送で二重に発火しない設計にする（応答の再利用、またはクライアント側でattemptId単位に抑止）。

**未決事項**: 現行の `200` 空レスポンス利用箇所との互換性、独立 `histories.id` の導入方法、同一 `clientAttemptId` のリクエスト内容が不一致のときの `409` などの扱い。

### 4.2 `GET /api/reviews/due?limit=20`

- 認証ユーザーの `next_review_at <= now` の問題を、期限順などで返す。
- 取得内容は `qid`, `nextReviewAt`, `state` 等の選出情報を基本とし、問題本体は既存 `/api/quizzes/by-ids` で取得。
- 削除済み・アクセス不可の問題は除外。
- 対象0件の場合は空配列。
- **初期案**: 日替わりセットの選出と同じドメインの候補選択ロジックを利用する。

### 4.3 `PUT /api/daily-sets/today` — 本日のセットを確定／取得

- 認証ユーザーとサーバー側JST日付をキーに、**存在しなければ5問のセットを生成して保存**。あれば**既存セットを一切作り直さず返す**。
- 同時リクエスト時も `(user_id, date)` の一意制約とトランザクションで1セットに確定。
- デフォルト復習3問＋未学習2問（復習不足時は新規で補完）。対象問題が5問未満なら、**重複なしである分だけ**返す。
- 出題順、選出理由、項目IDを永続化する。学習状態が後で変わっても当日のセットは不変。

### 4.4 `GET /api/daily-sets/today` — 読み取り専用

- 既に確定済みの当日セットと進捗を返す。
- `GET` のみでセットを新規作成しない。未作成時は `404` 等、**契約を実装前に決定**。クライアントは必要時に `PUT` でセットを確定する。
- 戻り値例:

```json
{
  "id": "daily-123",
  "date": "2026-11-06",
  "completed": 2,
  "total": 5,
  "items": [
    { "id": "1", "qid": "q1", "position": 1, "type": "review", "status": "completed" },
    { "id": "2", "qid": "q2", "position": 2, "type": "review", "status": "completed" },
    { "id": "3", "qid": "q3", "position": 3, "type": "review", "status": "pending" },
    { "id": "4", "qid": "q4", "position": 4, "type": "new", "status": "pending" },
    { "id": "5", "qid": "q5", "position": 5, "type": "new", "status": "pending" }
  ]
}
```

**端末間進捗**: 他端末の完了が次の取得で反映される。競合時の「同じ項目を別端末で同時解答したらどうするか」はルールを確定してから実装する。初期案は **daily item の完了は先着1回のみ**。他端末からの同一項目解答が自由演習履歴として残るかどうかは別途決定。

### 4.5 `GET /api/analysis/learning/summary?period=week`

提案指標:

- `attempts`: 期間内の総解答回数。
- `uniqueQuestions`: 期間内の異なる解答問題数。
- `revengeSuccesses`: 期間内のリベンジ成功イベント数。
- `reviewSuccesses`: 期間内の復習成功数。
- `reviewDue`: 現時点で期限を迎えている復習対象数。
- `retainedQuestions`: 現時点で定着と推定された問題数。

**指標定義の注意**: 件数／異なる問題数／イベント発生回数は異なる。期間内集計と現在時点のスナップショットを混ぜて誤表示しない。既存 `GET /api/analysis/status/:date/:period` で足りる学習量グラフは再利用する。

## 5. DBモデル（提案）

### 5.1 `user_question_states`

- `(user_id, quiz_id)` 複合主キーまたは一意制約。
- `state`: `learning | reviewing | retained`（未学習は**行が存在しない**ことでも表現可能）。
- `review_count`, `success_streak`, `interval_days`。
- `last_reviewed_at`, `next_review_at`, `updated_at`。
- 復習候補の抽出用 `(user_id, next_review_at)` インデックス。
- 削除やユーザー退会に対応する外部キーと削除ポリシーを既存規約に合わせる。

### 5.2 `daily_sets`

- `id`, `user_id`, `date`（**JST日付、DATE型を推奨**）, `created_at`。
- **UNIQUE `(user_id, date)`**。

### 5.3 `daily_set_items`

- `id`, `daily_set_id`, `quiz_id`, `position`, `type` (`new|review`), `completed_at`（nullable）。
- 推奨制約: UNIQUE `(daily_set_id, position)`、UNIQUE `(daily_set_id, quiz_id)`。
- 完了を成立させた解答イベントIDを保持するか、専用の関連テーブルで記録するかはPR #1/#6の設計で決定。

### 5.4 `histories` の拡張

- 既存データを維持しつつ、**独立ID** と `clientAttemptId` を格納する方針を検討。
- MySQLの `DATETIME(0)` と複合主キー衝突を解消するスキーマ変更計画が必要。
- 過去履歴からの習熟状態初期化は**安全なバックフィル**とし、一度の正解で「定着」としない。
- マイグレーションは既存適用済みSQLを編集しない。**開発／テスト環境で検証し、本番適用は別途承認**。

## 6. 復習アルゴリズムとイベント規則（初期案）

初期段階では簡易な間隔反復を採用する。以下は**暫定の例**であり、ユーザーの行動データから後で調整する。

| 状況 | 次回復習までの例 |
| --- | --- |
| 初回不正解 | 1日 |
| 復習1回目正解 | 2日 |
| 復習2回目正解 | 4日 |
| 復習3回目正解 | 7日 |
| 復習時不正解 | 1日に戻す |

- ドメインロジック `ReviewScheduler` は純粋関数／副作用なしで実装し、時刻を注入できる設計にする。
- `REVENGE_SUCCESS` は「前回の不正解から今回正解へ変化」を基本とし、必要なら翌日以降などの条件を追加する。
- `REVIEW_SUCCESS` は復習対象への成功として、初正解と区別する。
- `retained` は**推定状態**であり、永久定着を意味しない。定着判定基準は明文化する。
- FSRSは後続の選択肢。初期PRで複雑な記憶モデルを導入しない。

## 7. フロントエンド・UI/UX

4つの主要画面を想定:

| 画面 | 役割 |
| --- | --- |
| ホーム | **今日の5問**が主導線。直近の成長、前回の続き |
| 演習・検索 | 既存の自由検索／演習、スマート復習 |
| コレクション | お気に入り／問題集を継続利用 |
| 成長 | 正解率だけでなく復習成功、定着推定、期間推移 |

**ホーム→今日の5問→結果→学習の変化→翌日の復習**をMVPの主要動線とする。

**演出のルール**:

- 通常正解: 短い緑のフィードバック。
- 初正解: 小さな特別表示。
- 過去の不正解から正解: リベンジ専用の演出。
- 5問終了: その日の復習成功数などをまとめた結果表示。
- 青をブランド基調、緑を成功、金を特別達成、紫を知識の発見に使用。ただし色だけで意味を伝えない。
- アニメーションの短縮／無効化（`prefers-reduced-motion` 等）、効果音の任意無効化に対応。
- 不正解を不必要に罰しない。連続日数の喪失によって学習を強制しない。

既存の `PracticeSceneChanger` をなるべく再利用するが、**日替わりモードはサーバーが出題順と進捗を管理する**。自由演習のDexie管理と分離する。

## 8. オフライン・端末間同期

**原則**: サーバーがSource of Truth。Dexieはキャッシュ・未送信操作のキュー。

提案するDexieストア:

- `practiceSessions` — 既存の自由演習再開。
- `cachedDailySets` — サーバーで確定した当日の問題セットの写し。
- `cachedQuizzes` — 取得済み問題のオフライン表示用キャッシュ。
- `pendingAttempts` — 再送可能な解答操作（`clientAttemptId` 必須）。

要求:

1. オンラインで取得した同じ日替わりセットを、通信できない間も表示できる。
2. まだサーバーで生成されていない日替わりセットを**端末側で独自生成しない**。
3. 再送で解答履歴と習熟状態を二重更新しない。
4. オフライン中の進捗は暫定表示とし、オンライン復帰時にサーバー結果を正として調整する。
5. 複数端末同時操作の競合を明示的に扱う。サイレントな上書きを避ける。
6. キャッシュ済み問題の削除・アクセス権変更時の扱いと、異なるユーザーのデータ混在防止も検証する。

**注意**: MVPのスコープ・納期と同期の複雑さを再評価すること。オンライン同期を先に安定させ、オフラインキューを独立PRとして追加する段階方式が望ましい。

## 9. 開発順序 — 10PRのロードマップ

工数の目安は約45〜75時間、初期リリースまで4〜6週間（週10〜15時間作業想定）。**見積りは保証ではない**。

| PR | 内容 | 成果物・受入条件 | 目安 |
| --- | --- | --- | --- |
| #1 | **解答記録の整合性設計** | 履歴の一意識別・冪等性・時刻精度・競合方針を決定。既存挙動の回帰テスト | 3〜5h |
| #2 | **習熟状態DB** | Prisma migration、Kysely型、リポジトリ、複合一意制約 | 4〜6h |
| #3 | **復習スケジューラ** | 副作用なしのドメインロジックと単体テスト | 4〜6h |
| #4 | **`POST /api/practice` 拡張** | 履歴＋習熟更新のトランザクション、冪等性、イベント返却 | 6〜9h |
| #5 | **期限到来の復習API** | `GET /api/reviews/due` と期限順・権限のテスト | 3〜5h |
| #6 | **今日の5問のサーバー管理** | `daily_sets/items`、`PUT/GET /api/daily-sets/today`、JST・同時アクセス検証 | 6〜10h |
| #7 | **今日の5問UI** | ホーム導線、開始・中断・再開・別端末進捗反映 | 5〜8h |
| #8 | **学習成果集計** | `GET /api/analysis/learning/summary`、成長画面 | 4〜7h |
| #9 | **成果演出** | 初正解・リベンジ・セット完了、アクセシビリティ | 4〜6h |
| #10 | **オフライン同期＋総合テスト** | Dexie未送信キュー、同期・競合・回帰テスト | 6〜13h |

### PR間の依存関係

- #1 → #2/#4/#6/#10（解答ID・時刻・競合の方針を早めに確定）。
- #2 → #3 → #4 → #5 → #6。
- #6 → #7、#4 → #8/#9、#7/#4 → #10。
- 成長画面は既存分析の再利用を優先する。

### PRごとの提出物

各PRでは次を残すこと:

1. 変更の目的・非目標・対象ファイル。
2. API/DB/ドメイン設計と互換性への影響。
3. 追加・変更したテストと実行結果。
4. 既存設計とのトレードオフと、残された未決事項。
5. コードを理解するための簡潔な処理フロー説明。

## 10. テスト・品質・受入条件

**必須のシナリオ**:

- 同一ユーザーの別端末で、今日の5問の**ID・順序・進捗**が一致する。
- 同一日の初回同時要求でも1セットのみ作られる。
- JST 23:59/00:00の境界、サーバー側で日付が切り替わる。
- 出題済みセットは途中で復習状態が変わっても再生成されない。
- 復習対象0件、対象問題5件未満、削除済み問題を扱える。
- 既存正誤値0/1/2と検索上の未回答値3を混同しない。
- リベンジ成功・初正解・復習成功を正しい条件で判定する。
- 同じ `clientAttemptId` の再送では**履歴・習熟状態・実績・日替わり進捗**が重複しない。
- 不正な `dailySetItemId`、他ユーザーのセット、問題ID不一致を拒否する。
- 履歴保存と状態更新の片方が失敗したらトランザクションがロールバックする。
- 旧フロントエンド／自由演習／履歴／検索／コレクションに回帰がない。
- オフライン復帰時の同期と別端末競合でデータ消失やサイレント上書きがない。

**既存のリポジトリのガイドに従って実施するコマンド（実際の構成は再確認）**:

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
pnpm --filter backend test:integration  # Docker等の前提が満たされる場合
```

テストが実行できなかった場合は理由を記載する。DBに影響を与える操作は、接続先がテスト専用環境であることを確認してから行う。実運用データの上書き・破壊的操作は承認を得る。

## 11. 未決定事項・先に検討すべき意思決定

以下を**実装済み要件として決め打ちせず**、最初の設計レビューで提案と根拠を示すこと。

1. `histories` に独立IDを導入する方式と、旧複合主キーの安全な移行手順。
2. `clientAttemptId` 必須化の段階、旧クライアントとの互換性、同一IDで異なるリクエストを受信した場合のエラー仕様。
3. 一日分のセットを `PUT` で初回作成する契約と、未作成時の `GET` レスポンス。
4. 日替わりセットの対象問題範囲・フィルタ（ユーザーが所有する問題を基本とするか等）。
5. ユーザーが問題を削除した場合、既に確定したセットをどう表示・補完するか。
6. 復習成功／リベンジ成功／定着の定義。特に「前回不正解→正解」だけでよいか、時間間隔を条件に含めるか。
7. 同じdaily itemに対する別端末の同時解答／遅延同期の履歴・進捗ルール。
8. サーバー側での解答結果イベントをどの範囲まで永続化するか。
9. オフライン実装を初回リリース必須とするか、安定化後に段階追加するか。
10. 既存の `practiceSessions` と日替わりモードの再開状態の統合方法。

仕様上**確定していること**: 1日分の問題セットはサーバーで固定すること／全端末で同じセット・進捗を参照すること／既存機能とデータを守ること／学習効果をゲーム性より優先すること。

## 12. Codexへの作業依頼（最初のメッセージとして使用可）

> `woodnx/iQbe` の現在のリポジトリを読み、`AGENTS.md` と本ドキュメントを確認してください。まず**PR #1「解答記録の整合性設計」だけ**に着手してください。  
> 変更前に、`git status`、関連API・DBスキーマ・解答進行UI・既存テストを調査し、**確認できた事実／想定／未決事項**を分けて報告してください。  
> 特に `histories` の複合主キーと秒精度、`POST /api/practice` の既存契約、Dexieの現在の役割、解答保存の非同期処理、複数端末同期に必要な冪等性を分析してください。  
> 最初は設計案、候補となるスキーマ変更、API契約、移行・テスト戦略、想定される互換性リスクを提示し、**その場で全PRを実装しないでください**。許可が得られた範囲のコード・テストのみ変更してください。  
> 各変更について「なぜ必要か」「どこに責務を置くか」「どう検証したか」を説明してください。本番DB操作、破壊的変更、無断マージ・デプロイは禁止です。

## 参考リンク

- [iQbe repository](https://github.com/woodnx/iQbe)
- [AGENTS.md](https://github.com/woodnx/iQbe/blob/main/AGENTS.md)
- [Backend README](https://github.com/woodnx/iQbe/blob/main/packages/backend/README.md)
- [Hono API registration](https://github.com/woodnx/iQbe/blob/main/packages/backend/src/app.ts)
- [Prisma schema](https://github.com/woodnx/iQbe/blob/main/packages/backend/prisma/schema.prisma)
- [Practice API route](https://github.com/woodnx/iQbe/blob/main/packages/backend/src/routes/practice.ts)
- [Practice UI flow](https://github.com/woodnx/iQbe/blob/main/packages/frontend/src/features/practice/components/PracticeSceneChanger.tsx)
- [Dexie database](https://github.com/woodnx/iQbe/blob/main/packages/frontend/src/plugins/db.ts)
