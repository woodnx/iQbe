# Issue #314 実装計画: 解答保存への FSRS・成長イベント接続と既存履歴の引き継ぎ

- 対象 Issue: https://github.com/woodnx/iQbe/issues/314 （スコープ: Issue 全体）
- 計画作成日: 2026-11-16（2026-11-19 に FSRS 設定の版の記録を追加。§0.2。2026-11-27 に未学習の期限を `NULL` にする変更（§3.4）と、実装レビューでの設計変更（§0.4）を反映）
- 調査基準: ブランチ `woodnx/issue14`、HEAD `f1329fc`、および未コミットの作業ツリー
- この文書だけで実装に着手できるように書いてある。`design-docs-for-ai/` の他の文書は参照しない

## 0. 最初に読むこと

### 0.1 作るもの（1 段落）

`POST /api/practice` は現在、解答履歴（`histories`）を 1 行保存して本文なしの 200 を返すだけである。これを、1 つのトランザクションの中で「履歴の保存・FSRS による習熟状態（`user_quiz_states`）の更新・成長イベント（新テーブル `growth_events`）の記録・当日初回かどうかの識別の確定」をまとめて行い、確定結果を JSON で返す API に変える。同じ `clientAttemptId` の再送では何も増やさず、最初に確定した結果を返す。あわせて、既存の解答履歴から FSRS の状態を作る移行スクリプトと運用手順書、自由演習の「やめる」経路で押し位置が失われる不具合の修正を行う。

### 0.2 ユーザーと合意済みの決定（変更しないこと）

2026-11-16 と 2026-11-19 にユーザーへ確認して確定した。実装中に覆さない。

| 論点                             | 決定                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| テストコード                     | **新規テストの追加と既存テストの修正を、この計画に沿って実施する。** ルート `AGENTS.md` は「明示的な依頼なしにテストコードを追加・変更しない」と定めるが、本件はユーザーが明示的に依頼済みである。対象は §9 に列挙したものに限る                                                                                                                                                                                                                                                           |
| `dailySetItemId`                 | **この Issue では入力スキーマに追加しない。** 日替わりセットのテーブルは #308 で作るため。#308 が後から差し込めるよう、差し込み位置だけ §5.9 に書く                                                                                                                                                                                                                                                                                                                                        |
| 問題削除後の再送                 | **再送の判定は `histories` の一意制約だけで行う。専用の受理記録テーブルは作らない。** 問題を削除すると履歴は外部キーの連鎖で消えるので、その後の再送は `404 QUIZ_NOT_FOUND` になる（問題が無いので二重実行は起こり得ない）                                                                                                                                                                                                                                                                 |
| FSRS 設定の版（2026-11-19 追加） | **将来ユーザーが FSRS の設定を変えられるようにするため、この Issue で 2 つだけ先に入れる。** (1) `ReviewScheduler.ts` の `TARGET_RETENTION` を、FSRS に渡す目標定着率 `DEFAULT_DESIRED_RETENTION` と、定着判定のしきい値 `MIN_RETRIEVABILITY_FOR_RETAINED` に分ける。(2) `histories.review_settings_version` に、解答確定時に使った設定の**版番号**を記録する（今は常に 1）。版の値を持つ設定テーブルは作らず、設定機能の Issue で作る（§5.9）。設定値そのものを JSON で記録する案は不採用 |

### 0.3 守る制約

- 作業開始時に `git status` を確認する。`AGENTS.md`・`docs/` 配下・`GLOSSARY.md`・`skills-lock.json`・`user-prompt/` の未コミット変更は本件と無関係なので、取り消し・整形・コミットへの混入をしない。
- 適用済みのマイグレーション SQL を書き換えない。新しいマイグレーションを追加する。
- 実データ（本番など）へのマイグレーション適用と移行スクリプトの実行は、この実装作業に含めない。開発用 DB（`.config/.env` の `DATABASE_URL` が指す `iqbe-db-dev`）への適用だけ行ってよい。`migrate:reset` は実行しない。
- DB 接続のタイムゾーン設定・`DATETIME` の保存方法を変えない。日本時間の日付は必ずアプリ側で `Date`（瞬間）から計算する（理由は §4.4）。
- `ts-fsrs` は `5.4.2` 固定のまま。上げない（6 系は Node.js 24 以上が必要で、Docker 側は Node.js 22）。
- `packages/backend/src/db/types.ts` は生成物。手で編集せず §3.3 の手順で再生成する。
- コミットや PR の作成は、実装を依頼したユーザーの指示に従う。指示が無ければ作らず、§2 の単位で差分を分けて報告する。
- コード内の命名・コメントは `.agents/skills/code-naming/SKILL.md` と `.agents/skills/code-comments/SKILL.md` に従う（要点: 新しい名前に `get` を使わない／真偽値は `is`・`has` 等で始める／コメントは「なぜ他のやり方にしなかったか」だけを書く）。

### 0.4 実装レビューで変えた点（2026-11-27 反映）

実装後のレビューで次の点を変え、本文の該当節も今の実装に合わせて書き直した。§1 の「現状」は計画作成時点の事実なので変えていない。

| 変えた点                  | 計画作成時                                                                                  | 今の実装                                                                                                                      | 節               |
| ------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 入れ子のトランザクション  | 外側に合流するだけ                                                                          | 要求した分離レベルが外側と違えば例外                                                                                          | §5.1             |
| 当日の通し番号の規則      | 解答 API と移行がそれぞれ数える                                                             | `placeOnStudyDays` の 1 か所                                                                                                  | §5.4・§5.8・§7.2 |
| `HistoryInfra.add`        | ID を引いてから INSERT                                                                      | INSERT … SELECT の 1 文。0 行なら `NoResultError`                                                                             | §5.5             |
| `UserQuizStateInfra.save` | INSERT … ON DUPLICATE KEY UPDATE                                                            | UPDATE だけ。行が無ければ例外                                                                                                 | §5.6             |
| 時刻の秒への切り捨て      | リポジトリでも行う                                                                          | `ReviewService` だけで行う                                                                                                    | §5.6             |
| 未学習の期限              | 作成時刻などの仮の値                                                                        | `NULL`                                                                                                                        | §3.4             |
| 運用手順書                | README に節を追加。止めずに切り替える                                                       | `LEARNING_RECORD_MIGRATION.md` に分離。Docker でメンテナンス中に移行する                                                      | §7.4             |
| 成長イベントの型          | 判定は関数 `detectGrowthEvents` で種類の配列を返し、保存は `uid`・`qid`・種類をまとめて渡す | エンティティ `GrowthEvent`（`GrowthEvent.detect` が履歴 ID 付きで返す）。保存はイベントの配列で、ユーザー・問題は履歴から読む | §5.7・§5.8       |

## 1. 現状（2026-11-16 に確認した事実）

### 1.1 解答保存の経路

| ファイル                                                                     | 現状                                                                                                                             |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `packages/backend/src/routes/practice.ts`                                    | `PracticeUseCase` を `UserInfra`・`QuizInfra`・`HistoryInfra` で組み立てる。トランザクションは使っていない                       |
| `packages/backend/src/interfaces/controllers/Practice/schema.ts`             | 入力は `qid: string` / `judgement: 0..2 の整数` / `pressedWord: -1 以上の整数` / `clientAttemptId: uuid`                         |
| `packages/backend/src/interfaces/controllers/Practice/PracticeController.ts` | 成功は `c.body(null, 200)`、不一致は `c.json({code, message}, 409)`                                                              |
| `packages/backend/src/applications/usecases/PracticeUseCase.ts`              | `addPractice(uid, qid, judgement, pressedWordPosition, clientAttemptId)`。`HistoryService.add` を呼ぶだけ                        |
| `packages/backend/src/domains/History/HistoryServise.ts`                     | ユーザーと問題の存在確認 → `History` 生成 → `historyRepository.add`。無ければ `throw new Error("no find user or quiz")`（= 500） |
| `packages/backend/src/interfaces/infra/HistoryInfra.ts`                      | `add` は INSERT し、`ER_DUP_ENTRY` なら同じ `clientAttemptId` の既存行を読んで返す                                               |
| `packages/backend/src/domains/History/index.ts`                              | `History(qid, uid, pressedWordPosition, judgement, practicedAt, clientAttemptId)` と `hasSameAnswer`                             |

`histories` には #310 で `id`（BIGINT UNSIGNED AUTO_INCREMENT）と一意制約 `(user_id, client_attempt_id)` が入っている。これはやり直さない。

### 1.2 未コミットの FSRS 作業（作業ツリーに存在する。main には無い）

次のファイルは未コミットだが、内容は完成しており動作する（計画作成時にスクリプトで確認済み: 不正解 → 1 分後に再学習期限 → 正解で `phase: "review"`、初回正解も `review`、同一秒の連続解答も処理可能、200 日経過で定着推定が `false` に下がる）。

| ファイル                                                                                                                               | 役割                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `packages/backend/src/domains/UserQuizState/index.ts`（変更）                                                                          | エンティティ `UserQuizState`。`memory`・`needsRelearning` を持つ                      |
| `packages/backend/src/domains/UserQuizState/ReviewMemory.ts`（新規）                                                                   | `ReviewMemory`・`ReviewPhase` 型                                                      |
| `packages/backend/src/domains/UserQuizState/IReviewAlgorithm.ts`（新規）                                                               | `IReviewAlgorithm`・`ReviewJudgement`・`ReviewSnapshot`                               |
| `packages/backend/src/domains/UserQuizState/ReviewScheduler.ts`（新規）                                                                | `scheduleReview(previous, judgement, reviewedAt)`・`estimateRetention(previous, now)` |
| `packages/backend/src/applications/services/ReviewService.ts`（新規）                                                                  | 時刻を秒へ揃えてから `ReviewScheduler` を呼ぶ                                         |
| `packages/backend/src/applications/shared/IReviewTimeNormalizer.ts`（新規）                                                            | 時刻正規化の契約                                                                      |
| `packages/backend/src/interfaces/infra/MysqlReviewTimeNormalizer.ts`（新規）                                                           | 秒未満を切り捨てる                                                                    |
| `packages/backend/src/interfaces/infra/fsrs/FsrsReviewAlgorithm.ts`（新規）                                                            | `ts-fsrs` の呼び出し                                                                  |
| `packages/backend/src/interfaces/infra/fsrs/FsrsMemoryCodec.ts`（新規）                                                                | `fsrs_memory` JSON との相互変換                                                       |
| `packages/backend/src/interfaces/factories/createReviewService.ts`（新規）                                                             | `createReviewService()`                                                               |
| `packages/backend/src/interfaces/infra/UserQuizStateInfra.ts`（変更）                                                                  | `fsrs_memory` の読み書き。`save` は「存在確認 → INSERT か UPDATE」で並行解答に弱い    |
| `packages/backend/prisma/migrations/20261113000000_add_fsrs_memory/migration.sql`（新規）                                              | `user_quiz_states.fsrs_memory JSON NULL` を追加                                       |
| `packages/backend/prisma/schema.prisma`・`packages/backend/src/db/types.ts`・`packages/backend/package.json`・`pnpm-lock.yaml`（変更） | 上記に伴う変更（`ts-fsrs` `5.4.2` の追加を含む）                                      |

`UserQuizState` 関連は現在どの API からも使われていない。開発用 DB では `20261113000000_add_fsrs_memory` まで適用済み、`user_quiz_states` は 0 行、`histories` は 107 行（うち `client_attempt_id` が NULL の旧形式 91 行、同一秒の重複 0、`judgement` が 0〜2 以外の行 0）。他の環境では `20261113000000_add_fsrs_memory` は未適用の前提で扱う。

### 1.3 そのほかの事実

- 問題の物理削除は `QuizInfra.delete`（`DELETE FROM quizzes`）。`histories` と `user_quiz_states` は外部キー `ON DELETE CASCADE` で消える。`histories` を単独で消す経路は無い。
- トランザクションは `ITransactionManager.begin(callback)`。`KyselyClientManager` が `AsyncLocalStorage` でトランザクションを保持し、各リポジトリは `clientManager.getClient()` で同じトランザクションを得る。**同じ `KyselyClientManager` インスタンスを共有することが、トランザクション共有の契約である。**
- 開発用 DB は MySQL 9.1、既定の分離レベルは `REPEATABLE-READ`、Node プロセスのタイムゾーンは UTC。
- Prisma 7 では `prisma db push` の `--skip-generate` が廃止された。`packages/backend/src/api.integration.test.ts` の準備処理（50 行目付近）がこのフラグを渡しているため、`pnpm --filter backend test:integration` は現状テスト実行前に失敗する。
- フロントエンドの `PracticeSceneChanger.tsx` は「やめる」経路で `record(j, -1, "quit")` と押し位置を一律 `-1` で送っている。

## 2. 作業の分け方と順序

依存の順に 4 段階。各段階の終わりで `pnpm typecheck` と `pnpm test` が通る状態にする。PR にする場合はこの単位で分ける。履歴リポジトリの戻り値と `HistoryServise.ts` を変える段階では、それを使う `PracticeUseCase`・ルート・コントローラーも同じ段階で更新する。

| 段階 | 内容                                                                                                                                                                                                                                                                             | 主な節                                    |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1    | 未コミットの FSRS 作業を取り込み、FSRS の単体テストを足す（`createReviewService.test.ts` のうち `replayReviews` を使う 1 件と、`ReviewScheduler.test.ts` の `resolvePreviousState`・`replayReviews`・`toReviewJudgement` の観点は段階 2 で足す）                                 | §3.1、§9.1                                |
| 2    | スキーマ変更（マイグレーション・型の再生成）、ドメイン、リポジトリ、トランザクションの分離レベル指定、`PracticeUseCase`・ルート・コントローラーへの接続、応答 JSON、フロントエンドの HTTP エラー別の再送制御、関連テストと統合テスト。`HistoryServise.ts` の削除もこの段階で行う | §3〜§6、§9.1〜§9.4、§9.6 のエラー別テスト |
| 3    | 移行スクリプト、運用手順書                                                                                                                                                                                                                                                       | §7、§9.5                                  |
| 4    | フロントエンド: 「やめる」経路の押し位置の保持                                                                                                                                                                                                                                   | §8、§9.6                                  |

段階 1 の取り込み対象は §1.2 の表のファイルだけ。段階 1 を独立したコミットにする場合も、§0.3 の無関係なファイルを含めない。

## 3. データベースの変更

### 3.1 前提: `20261113000000_add_fsrs_memory`

既にファイルがあるのでそのまま使う。変更しない。

### 3.2 `schema.prisma` の変更

対象: `packages/backend/prisma/schema.prisma`

`model histories` の `pressed_word` の次に 7 列、リレーション 1 つ、一意制約 1 つを足す。

```prisma
model histories {
  id                BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  client_attempt_id String?  @db.VarChar(36)
  user_id           BigInt   @db.UnsignedBigInt
  quiz_id           BigInt   @db.UnsignedBigInt
  practiced         DateTime @db.DateTime(0)
  judgement         Int      @db.TinyInt
  pressed_word      Int?     @default(-1)
  // NULL は FSRS 接続前に保存された履歴。接続後の行と区別するため、既定値で埋めない。
  practice_mode        PracticeMode?
  // 日本時間の学習日と、その日の同じ問題への何回目の解答か（1 が当日初回解答）。
  study_date           DateTime?          @db.Date
  daily_attempt_number Int?               @db.UnsignedInt
  // 再送に同じ結果を返すための、解答確定時点の記録。現在値ではない。
  previous_judgement   Int?               @db.TinyInt
  review_state         QuizLearningState?
  next_review_at       DateTime?          @db.DateTime(0)
  // 解答確定時に使った FSRS 設定の版。版の値を持つテーブルは設定機能の Issue で作る。
  review_settings_version Int?            @db.UnsignedInt
  users             users    @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "histories_ibfk_1")
  quizzes           quizzes  @relation(fields: [quiz_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "histories_ibfk_2")
  growth_events     growth_events[]

  @@unique([user_id, client_attempt_id])
  @@unique([user_id, quiz_id, study_date, daily_attempt_number])
  @@index([user_id, quiz_id, practiced])
  @@index([quiz_id], map: "quiz_id")
  @@index([user_id, practiced], map: "histories_user_practiced_idx")
  @@index([practiced, user_id], map: "histories_practiced_user_idx")
}
```

`model quizzes` と `model users` のリレーション一覧に、それぞれ 1 行足す。

```prisma
  growth_events      growth_events[]
```

ファイル末尾に足す。

```prisma
enum PracticeMode {
  FREE
  DAILY_SET
  SMART_REVIEW
}

enum GrowthEventType {
  FIRST_CORRECT
  REVENGE_SUCCESS
  REVIEW_SUCCESS
}

model growth_events {
  id          BigInt          @id @default(autoincrement()) @db.UnsignedBigInt
  user_id     BigInt          @db.UnsignedBigInt
  quiz_id     BigInt          @db.UnsignedBigInt
  history_id  BigInt          @db.UnsignedBigInt
  type        GrowthEventType
  occurred_at DateTime        @db.DateTime(0)
  users       users           @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: Restrict)
  quizzes     quizzes         @relation(fields: [quiz_id], references: [id], onDelete: Cascade, onUpdate: Restrict)
  histories   histories       @relation(fields: [history_id], references: [id], onDelete: Cascade, onUpdate: Restrict)

  @@unique([history_id, type])
  @@index([user_id, occurred_at])
  @@index([quiz_id])
}
```

各列の意味と、この Issue で書き込む値:

| 列                        | 意味                                                 | 新しい解答                                                        | 既存の履歴（移行後）                |
| ------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------- |
| `practice_mode`           | 解答のモード                                         | 常に `FREE`（`DAILY_SET` は #308、`SMART_REVIEW` は #315 が書く） | `NULL`（不明）                      |
| `study_date`              | サーバーが確定した日本時間の学習日                   | 確定時刻から計算                                                  | 保存済みの `practiced` から計算     |
| `daily_attempt_number`    | 同じユーザー・問題・学習日での通し番号。全モード共通 | 同日の既存行数 + 1                                                | `practiced`、`id` の昇順で採番      |
| `previous_judgement`      | 直前の解答の判定。初回は `NULL`                      | 設定                                                              | `NULL`                              |
| `review_state`            | 解答直後の `LEARNING` / `REVIEWING` / `RETAINED`     | 設定                                                              | `NULL`                              |
| `next_review_at`          | 解答直後の次回復習期限                               | 設定                                                              | `NULL`                              |
| `review_settings_version` | 解答確定時に使った FSRS 設定の版（§5.3）             | `CURRENT_REVIEW_SETTINGS_VERSION`（今は常に 1）                   | `NULL`（再生には版 1 の設定を使う） |

- **「FSRS 接続前の履歴かどうか」は `practice_mode IS NULL` で判定する。** `previous_judgement` の NULL は「初回解答」の意味でも使うので、判定に使わない。
- 一意制約 `(user_id, quiz_id, study_date, daily_attempt_number)` は、同時送信で当日初回が 2 つできないことを DB でも保証するためのもの。MySQL の一意制約は NULL を重複とみなさないので、移行前の行（NULL）は制約に掛からない。
- 将来の「押し位置の集計対象」は `daily_attempt_number = 1 AND judgement = 1 AND pressed_word >= 0` で選べる。`pressed_word` の `-1` と `NULL` は位置不明。この Issue では保存までで、集計・表示は作らない。
- `growth_events` は問題削除・履歴削除・ユーザー削除のいずれでも連鎖削除される（Issue の「問題削除時は成長イベントも削除」）。一意制約 `(history_id, type)` が「同一解答の同一種類を重複保存しない」を保証する。

### 3.3 マイグレーションファイルと型の再生成

新規作成: `packages/backend/prisma/migrations/20261116000000_add_practice_learning_records/migration.sql`

内容は次のとおり。これは §3.2 の変更前後のスキーマから `prisma migrate diff --from-schema … --to-schema … --script` で生成した SQL である。手で書き換えない。

- 2026-11-16: `review_settings_version` を除いた版を生成し、使い捨ての MySQL 9.1 に適用して、§3.2 のスキーマとの差分が無いこと（`prisma migrate diff --exit-code` が 0）を確認した。
- 2026-11-19: `review_settings_version` を加えたスキーマで再生成した（スキーマどうしの差分で、DB には接続していない）。前回との違いは `ADD COLUMN review_settings_version` の 1 行だけ。**この版を MySQL に適用する確認はまだしていない。** 実装時に §9.4-10 の統合テストと、開発用 DB での `pnpm migrate:status` で確認する。

```sql
-- AlterTable
ALTER TABLE `histories` ADD COLUMN `daily_attempt_number` INTEGER UNSIGNED NULL,
    ADD COLUMN `next_review_at` DATETIME(0) NULL,
    ADD COLUMN `practice_mode` ENUM('FREE', 'DAILY_SET', 'SMART_REVIEW') NULL,
    ADD COLUMN `previous_judgement` TINYINT NULL,
    ADD COLUMN `review_settings_version` INTEGER UNSIGNED NULL,
    ADD COLUMN `review_state` ENUM('LEARNING', 'REVIEWING', 'RETAINED') NULL,
    ADD COLUMN `study_date` DATE NULL;

-- CreateTable
CREATE TABLE `growth_events` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `quiz_id` BIGINT UNSIGNED NOT NULL,
    `history_id` BIGINT UNSIGNED NOT NULL,
    `type` ENUM('FIRST_CORRECT', 'REVENGE_SUCCESS', 'REVIEW_SUCCESS') NOT NULL,
    `occurred_at` DATETIME(0) NOT NULL,

    INDEX `growth_events_user_id_occurred_at_idx`(`user_id`, `occurred_at`),
    INDEX `growth_events_quiz_id_idx`(`quiz_id`),
    UNIQUE INDEX `growth_events_history_id_type_key`(`history_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `histories_user_id_quiz_id_study_date_daily_attempt_number_key` ON `histories`(`user_id`, `quiz_id`, `study_date`, `daily_attempt_number`);

-- AddForeignKey
ALTER TABLE `growth_events` ADD CONSTRAINT `growth_events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `growth_events` ADD CONSTRAINT `growth_events_quiz_id_fkey` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `growth_events` ADD CONSTRAINT `growth_events_history_id_fkey` FOREIGN KEY (`history_id`) REFERENCES `histories`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
```

手順（リポジトリルートで実行）:

```bash
# 1. Kysely の型（packages/backend/src/db/types.ts）を再生成する。DB には接続しない。
pnpm exec env-cmd -f .config/.env pnpm --filter backend exec prisma generate

# 2. 開発用 DB に未適用のマイグレーションだけを適用する。
#    事前に .config/.env の DATABASE_URL のホストが iqbe-db-dev であることを確認する（値全体は出力しない）。
pnpm migrate:deploy

# 3. 「Database schema is up to date!」を確認する。
pnpm migrate:status
```

再生成後の `types.ts` に `PracticeMode`・`GrowthEventType`・`growth_events`、および `histories` の 7 列が出ていることを確認する。`study_date` と `next_review_at` の型は `Timestamp | null`、`daily_attempt_number`・`previous_judgement`・`review_settings_version` は `number | null` になる。

### 3.4 追加: `20261124000000_allow_null_review_due`

計画作成後に追加したマイグレーション。`user_quiz_states.next_review_at` を `DateTime?`（`NULL` 可）にし、未学習の行（`last_reviewed_at IS NULL`）に入っていた仮の期限を `NULL` にそろえる。解答済みの行は変えない。

- 未学習の期限に作成時刻などを入れると「期限が来た復習」と区別できないため、未学習は `NULL`（期限なし）で表す。
- `UserQuizState` は `lastReviewedAt` と `nextReviewAt` が両方 `null`（未学習）か両方値ありのどちらかで、片方だけなら生成時に `RangeError` を投げる。
- `UserQuizState.create(uid, qid)` は時刻を受け取らない。`findOrCreateForUpdate(uid, qid)` も作成時刻の引数を持たず、未学習の行を `next_review_at = NULL` で作る。

## 4. 設計の要点（実装前に理解しておくこと）

### 4.1 処理の流れ

```text
POST /api/practice
  1. REPEATABLE READ の読み取りトランザクションで clientAttemptId の履歴を探す
       あり → 要求 qid を DB に保存された qid へ揃えて比較し、同じ読み取り時点の成長イベントも得る。内容が同じなら保存済みの結果を 200、違えば 409。ここで終了
  2. 問題の存在を確認し、DB に保存された qid へ揃える。無ければ 404 QUIZ_NOT_FOUND
  3. トランザクション開始（READ COMMITTED）
       a. user_quiz_states の行を「無ければ作って」排他ロックする      ← 直列化の起点
       b. そのユーザー・問題の履歴を古い順に全件読む
       c. 解答直前の状態を決める（保存済みの状態が履歴と合っていればそれ、合わなければ履歴から再生）
       d. 現在時刻を取り、FSRS で次の状態を計算する。確定時刻 = 秒に揃えた時刻
       e. 学習日・当日の通し番号・直前の判定・成長イベントを決める
       f. histories に INSERT（重複キーなら専用の例外を投げて全体をロールバック）
       g. user_quiz_states を保存、growth_events を INSERT
     コミット → 200 と確定結果
  4. 3 で「clientAttemptId の重複」例外が出た場合（同じ ID の同時送信に負けた）
       → 勝った側の履歴と成長イベントを 1 と同じ読み取りトランザクションで読み直し、200 か 409
     3 で問題削除に起因する ID 検索・外部キーエラーが出た場合
       → ロールバック後に問題を読み直し、存在しなければ 404、存在すれば元のエラーを投げる
```

### 4.2 直列化とロック（初回状態が無い場合を含む）

同じユーザー・問題への並行解答は、`user_quiz_states` の主キー `(user_id, quiz_id)` の行ロックで直列化する。行がまだ無い初回解答でも同じ行をロックできるよう、次の 2 文を必ずこの順で実行する。

1. `INSERT INTO user_quiz_states (...未学習の初期値...) ON DUPLICATE KEY UPDATE user_id = <同じ値>`
2. `SELECT ... FROM user_quiz_states WHERE user_id = ? AND quiz_id = ? FOR UPDATE`

- 行が無い状態で先に `SELECT ... FOR UPDATE` すると、InnoDB はギャップロックを取り、同時に来た 2 つの初回解答が互いの INSERT を待ってデッドロックする。先に upsert して行を必ず存在させることで、2 の文は「一意な検索条件に一致する 1 行」だけをロックする。
- `INSERT ... ON DUPLICATE KEY UPDATE` は、重複時に共有ロックではなく排他ロックを取る（主キーの重複ではレコードロック）。
- 1 で作った仮の行は、同じトランザクションの g で必ず上書きされる。途中で失敗すればロールバックで消える。
- ロックを取ってから現在時刻を読む（d）。これにより、確定時刻の順序と処理順（= `histories.id` の順）が一致する。クライアントの時計は使わない。

根拠:

- MySQL リファレンス「Locks Set by Different SQL Statements in InnoDB」 https://dev.mysql.com/doc/refman/9.1/en/innodb-locks-set.html （"`INSERT ... ON DUPLICATE KEY UPDATE` differs from a simple `INSERT` in that an exclusive lock rather than a shared lock is placed on the row to be updated when a duplicate-key error occurs." / "For a unique index with a unique search condition, `InnoDB` locks only the index record found, not the gap before it."）
- 計画作成時の実測: 使い捨ての MySQL 9.1 で、行が無い状態から同じユーザー・問題へ 25 件を同時送信し、25 件とも成功・通し番号 1〜25 が重複なし・`review_count = 25`・デッドロック 0 を確認した。

### 4.3 分離レベルを READ COMMITTED にする理由

MySQL の既定 `REPEATABLE READ` では、トランザクション内の通常の SELECT は「最初の読み取り時点のスナップショット」を読み続ける。ロック待ちの前に 1 回でも通常の SELECT を実行していると、ロック取得後も、先行トランザクションがコミットした履歴が見えない。その結果、直前の判定・当日の通し番号・初正解の判定が古い値になる。

計画作成時の実測: `REPEATABLE READ` のまま、ロック前に通常の SELECT を 1 回挟んで 8 件を同時送信したところ、ロックして読んだ `review_count` は 1〜8 と進むのに、通常の SELECT で数えた履歴件数は全トランザクションで 1 のままだった。

`READ COMMITTED` では文ごとに新しいスナップショットを読むので、文の順序に依存せず正しくなる。そのため、解答保存と移行スクリプトの**書き込み**トランザクションは `READ COMMITTED` を明示する。一方、保存済み解答の再送では履歴と成長イベントを複数の SELECT で読むため、同じ時点を保つ `REPEATABLE READ` の読み取りトランザクションを使う（§5.8）。移行の読み取り専用の事前・完了確認も、状態と履歴を同じ時点で比較するため、組ごとの `REPEATABLE READ` トランザクションで行う（§7.2）。問題削除や新しい解答の確定が 2 つの SELECT の間に入っても、読み取り結果を混ぜない。

根拠: MySQL リファレンス「Transaction Isolation Levels」 https://dev.mysql.com/doc/refman/9.1/en/innodb-transaction-isolation-levels.html （READ COMMITTED: "Each consistent read, even within the same transaction, sets and reads its own fresh snapshot." / REPEATABLE READ: "Consistent reads within the same transaction read the snapshot established by the first read."）

### 4.4 時刻と日本時間の学習日

- 確定時刻は `ReviewService.scheduleReview` が返す状態の `lastReviewedAt`（秒未満を切り捨てた時刻）。これを `histories.practiced`・`growth_events.occurred_at`・FSRS の 3 か所で同じ値として使う。
- サーバーの時計が戻った場合や未来日時の履歴がある場合に備え、FSRS に渡す時刻は「現在時刻」と「直前の解答時刻」の遅いほうにする（`ReviewScheduler` は直前より前の時刻を `RangeError` で拒否する）。
- 学習日は確定時刻（`Date`）から `dayjs(instant).tz("Asia/Tokyo").format("YYYY-MM-DD")` で求める。**SQL の日付関数で `practiced` から学習日を求めてはいけない。** `DATETIME` は mysql2 が Node プロセスのローカル時刻で読み書きしており、列の値がどのタイムゾーンの壁時計かは環境に依存するため。アプリは必ず mysql2 が返した `Date` を経由する。
- `study_date`（`DATE` 型）は文字列 `"YYYY-MM-DD"` で書き込み、読むときは SQL 側で `DATE_FORMAT(histories.study_date, '%Y-%m-%d')` として文字列で受ける。そのまま読むと mysql2 がプロセスのローカル時刻 0 時の `Date` にして返すため、タイムゾーン次第で日付がずれる（実測: UTC のプロセスで `2026-11-16T00:00:00.000Z` が返った）。
- 当日の通し番号は「b で読んだ履歴のうち、学習日が今回と同じものの件数 + 1」。SQL での範囲集計はしない。移行前の行（`study_date` が NULL）も `practiced` から学習日を計算して数えるので、移行の前後で番号が食い違わない。

### 4.5 習熟状態は履歴から再現できる

FSRS は揺らぎ無し（`enable_fuzz: false`）で、渡す時刻は `histories.practiced` と同じ値なので、**習熟状態は「そのユーザー・問題の履歴を `practiced`・`id` の昇順に再生した結果」と常に一致する。** これを使い、解答直前の状態を次の規則で決める（`ReviewScheduler.resolvePreviousState`、§5.3）。

| 履歴     | 保存済みの状態                                     | 解答直前の状態                                    |
| -------- | -------------------------------------------------- | ------------------------------------------------- |
| 0 件     | `reviewCount === 0` かつ `lastReviewedAt === null` | 保存済みの状態（未学習）                          |
| 0 件     | 上記以外（解答済みなのに履歴が無い）               | 再現不能。`UnreplayableReviewStateError` を投げる |
| 1 件以上 | `memory !== null` かつ `reviewCount === 履歴件数`  | 保存済みの状態                                    |
| 1 件以上 | 上記以外                                           | 履歴を再生して作る                                |

この 1 つの規則で次を満たす。

- 既存履歴がある問題への最初の解答で、未学習として黙って初期化せず、履歴から正しい状態を作る（遅延移行）。
- 移行スクリプトと新しい解答が競合しても、どちらも同じロックの下で同じ規則を使うので、先に処理したほうの結果が残り、上書きは起きない。
- 切替前に旧バージョンのアプリが書いた履歴は、最初の新バージョンの解答で件数の不一致を検出して作り直す。新バージョンで書き込みを始めた後に旧バージョンから同じ DB へ書き込む運用は許可しない（§7.4）。
- 履歴が無いのに解答済みの状態は、推測で補わずエラーにする（解答 API は 500、移行スクリプトは識別情報を報告）。

このロックに参加するのは新バージョンの解答 API と移行スクリプトだけである。旧バージョンの `HistoryServise.ts` は `user_quiz_states` をロックしないので、旧・新の書き込みを重ねると履歴と状態・当日番号が不一致になる。旧アプリの停止と実行中リクエストの完了を確認してから、新アプリの書き込みを開始する（§7.4）。

1 つのユーザー・問題の履歴は少数（開発用 DB で最大 3 件）なので、解答のたびに全件読むコストは小さい。

この性質は、FSRS の設定が変わらないことを前提にしている。この Issue では設定は版 1（§5.3 の `CURRENT_REVIEW_SETTINGS_VERSION`）だけで、再生も版 1 の設定で行う。各解答に版を記録しておく（§3.2 の `review_settings_version`）のは、将来ユーザーが設定を変えられるようにしたとき、各解答を当時の設定で再生して、この性質を保てるようにするためである（§5.9）。

### 4.6 成長イベントの判定

解答直前の履歴・状態に対して判定する。入力はすべて §4.1 の b〜d で得た値。

| 種類              | 成立条件                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `FIRST_CORRECT`   | 今回が正解（`judgement === 1`）で、それ以前の履歴に正解が 1 件も無い                                      |
| `REVENGE_SUCCESS` | 今回が正解で、直前の履歴の判定が `0`（不正解）または `2`（スルー）                                        |
| `REVIEW_SUCCESS`  | 今回が正解で、解答直前の状態が解答済み（`lastReviewedAt !== null`）で、その `nextReviewAt` が確定時刻以前 |

- 初正解は `growth_events` ではなく `histories` の正解の有無で判定する。過去のイベントは後付けしないが、過去に正解済みの問題を導入後に正解しても初正解にはならない。
- 初回解答は解答直前の状態が未学習（`lastReviewedAt === null`）なので、復習成功にならない。
- 1 つの解答で複数成立してよい。初回不正解 → 1 分後に初めて正解 → 3 種類すべて成立する。
- 応答と保存の並び順は常に `FIRST_CORRECT`、`REVENGE_SUCCESS`、`REVIEW_SUCCESS`。

## 5. バックエンドの変更（ファイル別）

パスはすべて `packages/backend/` からの相対。

### 5.1 `src/applications/shared/ITransactionManager.ts`（変更）と `src/interfaces/infra/kysely/KyselyTransactionManager.ts`（変更）

```ts
export type TransactionOptions = Readonly<{
  isolationLevel?: "read committed" | "repeatable read";
}>;

export default interface ITransactionManager {
  begin<T>(
    callback: () => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T>;
}
```

```ts
export default class KyselyTransactionManager implements ITransactionManager {
  constructor(private clientManager: KyselyClientManager) {}

  async begin<T>(
    callback: () => Promise<T>,
    options: TransactionOptions = {},
  ): Promise<T> {
    const active = this.clientManager.getActiveTransaction();
    if (active) {
      // 実行中のトランザクションの分離レベルは MySQL では変えられない。指定を無視して
      // 外側に相乗りすると、前提と違う読み取りで黙って誤った値を書き得るため、ここで止める。
      if (
        options.isolationLevel !== undefined &&
        options.isolationLevel !== active.isolationLevel
      ) {
        throw new Error(
          `A nested transaction requires "${options.isolationLevel}", but the outer transaction uses "${active.isolationLevel ?? "the server default"}"`,
        );
      }
      return callback();
    }
    const isolationLevel = options.isolationLevel ?? null;
    const transaction = isolationLevel
      ? db.transaction().setIsolationLevel(isolationLevel)
      : db.transaction();
    return transaction.execute((trx) =>
      this.clientManager.withTransaction(trx, callback, isolationLevel),
    );
  }
}
```

`KyselyClientManager`（`src/interfaces/infra/kysely/KyselyClientManager.ts`、変更）は、`AsyncLocalStorage` にトランザクションと分離レベルの組 `{ trx, isolationLevel }` を保持する。`isolationLevel` は指定せずに始めたら `null`（サーバーの既定値で、コードからは確定できない）。`getClient()` は従来どおり実行中のトランザクションか `db` を返し、`getActiveTransaction()` で組を返す。`withTransaction(trx, callback, isolationLevel = null)`。

- 入れ子で分離レベルを指定しなければ、外側にそのまま合流する。
- 指定した分離レベルが外側と違う（外側が未指定の場合を含む）と例外にする。MySQL は実行中のトランザクションの分離レベルを変えられないので、黙って合流すると、例えば `READ COMMITTED` を前提にロック後の最新行を読むつもりの処理が、`REPEATABLE READ` の古いスナップショットを読んで誤った値を書き得る。
- #308 で解答保存を日替わりセットの処理と同じトランザクションにまとめる場合は、外側を `READ COMMITTED` で始めるか、内側の処理を外側へ合わせるかを、そのときに決める。

- `src/applications/shared/MockTransactionManager.ts` は変更不要（引数が少ないメソッドはそのまま代入できる）。
- 既存の呼び出し（引数 1 つ）は挙動が変わらない。
- Kysely 0.29.8 の書き方の根拠: `packages/backend/node_modules/kysely/dist/kysely.d.ts` の `TransactionBuilder`（`setIsolationLevel(isolationLevel: IsolationLevel): TransactionBuilder<DB>`、`IsolationLevel` は `'read committed'` と `'repeatable read'` を含む）。ソース: https://github.com/kysely-org/kysely/blob/v0.29.8/src/kysely.ts 。基本形: https://kysely.dev/docs/examples/transactions/simple-transaction 。MySQL では Kysely が `set transaction isolation level ...` を `begin` の前に発行し、これは次の 1 トランザクションにだけ効く（https://dev.mysql.com/doc/refman/9.1/en/set-transaction.html ）。

### 5.2 `src/plugins/day.ts`（変更）

末尾の `export default dayjs;` の前に追加する。

```ts
// 学習日は日本時間の暦日。DATETIME 列の値から SQL で求めないのは、列の壁時計が
// Node プロセスのタイムゾーンに依存するため（mysql2 が返した Date を必ず経由する）。
export const toStudyDate = (instant: Date): string =>
  dayjs(instant).tz("Asia/Tokyo").format("YYYY-MM-DD");
```

根拠: Day.js「Time Zone」 https://day.js.org/docs/en/timezone/timezone （`dayjs(...).tz("America/Toronto")` の形。`utc` と `timezone` プラグインはこのファイルの先頭で既に `extend` 済み）。

### 5.3 `src/domains/UserQuizState/ReviewScheduler.ts`（変更）と `src/applications/services/ReviewService.ts`（変更）

**定数の分割（2026-11-19 の決定、§0.2）**: `ReviewScheduler.ts` 先頭の `export const TARGET_RETENTION = 0.9;` を次の 3 つに置き換える。`estimateRetention` の比較には `MIN_RETRIEVABILITY_FOR_RETAINED` を、`scheduleReview` から `algorithm.schedule` へ渡す目標定着率には `DEFAULT_DESIRED_RETENTION` を使う。`TARGET_RETENTION` は未コミットの作業で付けた名前で main には無いので、改名してよい（参照は同じファイルの 2 か所だけ）。

```ts
export const DEFAULT_DESIRED_RETENTION = 0.9;

// 定着の判定基準をユーザーの目標定着率と連動させないのは、目標を下げたユーザーの
// 「定着」が甘くなり、成長画面の定着数をユーザー間で比べられなくなるため。
export const MIN_RETRIEVABILITY_FOR_RETAINED = 0.9;

// 版を上げずに DEFAULT_DESIRED_RETENTION や FsrsReviewAlgorithm の学習ステップを変えると、
// 過去の解答を再生した結果が保存済みの状態と食い違う（histories.review_settings_version に当時の版を記録している）。
export const CURRENT_REVIEW_SETTINGS_VERSION = 1;
```

- 値はどちらも 0.9 のままなので、この分割で計算結果は変わらない。
- `FsrsMemoryCodec.ts` の `FSRS_PROFILE_VERSION`（`"fsrs6-v1"`）は、記憶データの形式とアルゴリズムの版を表す。ユーザーの設定の版とは別物なので、兼用しない。`fsrs/` 配下は変更しない。

`ReviewScheduler.ts` に、さらに次を追加する。既存の `scheduleReview` 冒頭の判定値チェックは `toReviewJudgement` の呼び出しに置き換えてよい。

```ts
export type PastReview = Readonly<{ judgement: number; practicedAt: Date }>;

/** 解答済みの状態なのに、再生できる解答履歴が無い。推測で記憶モデルを作らないために投げる。 */
export class UnreplayableReviewStateError extends Error {}

export function toReviewJudgement(judgement: number): ReviewJudgement {
  if (judgement !== 0 && judgement !== 1 && judgement !== 2) {
    throw new RangeError("Review judgement must be 0, 1, or 2");
  }
  return judgement;
}
```

クラス `ReviewScheduler` にメソッドを 2 つ追加する。

```ts
  /** pastReviews は古い順（practiced、id の昇順）で渡す。 */
  replayReviews(
    uid: string,
    qid: string,
    pastReviews: readonly PastReview[],
  ): UserQuizState {
    if (pastReviews.length === 0) {
      throw new RangeError("Replaying requires at least one past review");
    }
    return pastReviews.reduce(
      (state, pastReview) =>
        this.scheduleReview(
          state,
          toReviewJudgement(pastReview.judgement),
          pastReview.practicedAt,
        ),
      UserQuizState.create(uid, qid),
    );
  }

  resolvePreviousState(
    saved: UserQuizState,
    pastReviews: readonly PastReview[],
  ): UserQuizState {
    if (pastReviews.length === 0) {
      const isUnlearned = saved.reviewCount === 0 && saved.lastReviewedAt === null;
      if (!isUnlearned) {
        throw new UnreplayableReviewStateError(
          `Review state of quiz ${saved.qid} has no history to replay`,
        );
      }
      return saved;
    }
    // 件数だけを比べるのは、習熟状態が履歴の再生結果と常に一致するため
    // （揺らぎ無しの FSRS に、履歴と同じ確定時刻を渡している）。
    const isInSyncWithHistory =
      saved.memory !== null && saved.reviewCount === pastReviews.length;
    return isInSyncWithHistory
      ? saved
      : this.replayReviews(saved.uid, saved.qid, pastReviews);
  }
```

`ReviewService.ts` に委譲メソッドを 1 つ追加する。

```ts
  resolvePreviousState(saved: UserQuizState, pastReviews: readonly PastReview[]) {
    return this.scheduler.resolvePreviousState(saved, pastReviews);
  }
```

`History`（§5.4）は `judgement` と `practicedAt` を持つので、`History[]` をそのまま `PastReview[]` として渡せる。

`ts-fsrs` 5.4.2 の API は既存の `FsrsReviewAlgorithm.ts` が正しく使っており、変更しない。確認した書き方: `fsrs({ request_retention, enable_fuzz: false, enable_short_term: true, learning_steps: ["1m"], relearning_steps: ["1m"] })`、`scheduler.next(card, now, Rating.Good).card`、`scheduler.get_retrievability(card, now, false)`（第 3 引数 `false` で数値を返す）、`createEmptyCard(now)`。根拠: `packages/backend/node_modules/ts-fsrs/dist/index.d.ts`、https://github.com/open-spaced-repetition/ts-fsrs/blob/v5.4.2/README.md 。

### 5.4 `src/domains/History/`（変更・新規）

**`index.ts`（変更）**: 型を追加し、コンストラクターの末尾に省略可能な引数を 4 つ足す。既存の 6 引数の呼び出しはそのまま動く。

```ts
import type { QuizLearningState } from "../UserQuizState/index.js";

export type PracticeMode = "FREE" | "DAILY_SET" | "SMART_REVIEW";

/** 日本時間の学習日と、その日の同じ問題への通し番号（1 が当日初回解答）。 */
export type StudyDayPlacement = Readonly<{
  studyDate: string;
  dailyAttemptNumber: number;
}>;

/** 解答を確定した時点の記録。再送にはこれを返し、現在の状態で作り直さない。 */
export type ReviewOutcome = Readonly<{
  previousJudgement: number | null;
  reviewState: QuizLearningState;
  nextReviewAt: Date;
  reviewSettingsVersion: number;
}>;

export default class History {
  constructor(
    private _qid: string,
    private _uid: string,
    private _pressedWordPosiston: number | null,
    private _judgement: number,
    private _practicedAt: Date,
    private _clientAttemptId: string | null,
    private _id: bigint | null = null,
    private _mode: PracticeMode | null = null,
    private _studyDayPlacement: StudyDayPlacement | null = null,
    private _reviewOutcome: ReviewOutcome | null = null,
  ) {}
  // 既存のアクセサはそのまま。id / mode / studyDayPlacement / reviewOutcome のアクセサを追加する。

  hasSameAnswer(other: History): boolean {
    // FSRS 接続前の履歴はモードが不明（null）なので、モードは両方が分かるときだけ比べる。
    const hasSameMode =
      this.mode === null || other.mode === null || this.mode === other.mode;
    return (
      this.uid === other.uid &&
      this.qid === other.qid &&
      this.judgement === other.judgement &&
      this.pressedWordPosition === other.pressedWordPosition &&
      hasSameMode
    );
  }
}
```

- `hasSameAnswer` の `qid` 比較は文字列の厳密一致でよいが、呼び出し前に §5.8 の `IQuizRepository.findByQid` で要求 qid を DB の保存値へ揃える。`quizzes.qid` の `utf8mb4_unicode_ci` は大文字・小文字を区別しないため、要求値 `"ab"` が保存値 `"Ab"` の問題を指し得る。アプリ側で `toLowerCase()` する案は、MySQL の照合順序と一致せず同じ問題の判定を保証できない。
- `histories.id` とそれを参照する `growth_events.history_id` は DB の `BIGINT UNSIGNED` であり、JavaScript の `number` を経由させない。ドメインとリポジトリの境界では `bigint`、JSON の `attemptId` では 10 進文字列を使う。生成された `db/types.ts` の BIGINT 列は `number` のままなので、該当 ID の読み書きだけ §5.5・§5.7 の SQL 式で精度を保つ。生成物を手で直さない。
- `mode === null` は「FSRS 接続前の履歴」。`reviewOutcome === null` も同じ行で起きる。移行後の旧履歴は `studyDayPlacement` だけが入る。

**`DuplicateClientAttemptError.ts`（新規）**

```ts
/** 同じユーザーの同じ clientAttemptId が既に保存されていた。保存処理は何も確定していない。 */
export default class DuplicateClientAttemptError extends Error {
  constructor(cause: unknown) {
    super("clientAttemptId is already recorded", { cause });
    this.name = "DuplicateClientAttemptError";
  }
}
```

**`IHistoryRepository.ts`（変更）**

```ts
export type AnsweredPair = Readonly<{ uid: string; qid: string }>;

export type StudyDayAssignment = Readonly<{
  historyId: bigint;
  studyDate: string;
  dailyAttemptNumber: number;
}>;

export default interface IHistoryRepository {
  getAllDates(uid: string): Promise<Date[]>;
  /** 保存した履歴の id を返す。clientAttemptId が保存済みなら DuplicateClientAttemptError を投げる。 */
  add(history: History): Promise<bigint>;
  findByClientAttemptId(
    uid: string,
    clientAttemptId: string,
  ): Promise<History | null>;
  /** 古い順（practiced、id の昇順）。 */
  listByUidAndQid(uid: string, qid: string): Promise<History[]>;
  /** 移行用。学習日がまだ入っていない行だけを更新する。 */
  assignStudyDayPlacements(
    assignments: readonly StudyDayAssignment[],
  ): Promise<void>;
  /** 移行用。解答履歴があるユーザー・問題の組を uid、qid の昇順で返す。after の次から limit 件。 */
  listAnsweredPairs(
    after: AnsweredPair | null,
    limit: number,
  ): Promise<AnsweredPair[]>;
}
```

`getAllDates` は既存の名前なので変えない。

**`placeOnStudyDays`（`src/domains/History/index.ts` に追加）**: 当日の通し番号の規則を 1 か所に置く。解答 API（§5.8）と移行（§7.2）の両方がこれを使い、同じ履歴に同じ番号を振る。

```ts
/**
 * 1 組のユーザー・問題の解答時刻（古い順。同時刻は履歴 ID 順）に、日本時間の学習日と
 * その日の通し番号を振る。新しい解答の記録と既存履歴の移行で同じ番号にするため、規則はここだけに置く。
 */
export function placeOnStudyDays(
  practicedAts: readonly Date[],
): StudyDayPlacement[] {
  const attemptCountByDate = new Map<string, number>();
  return practicedAts.map((practicedAt) => {
    const studyDate = toStudyDate(practicedAt);
    const dailyAttemptNumber = (attemptCountByDate.get(studyDate) ?? 0) + 1;
    attemptCountByDate.set(studyDate, dailyAttemptNumber);
    return { studyDate, dailyAttemptNumber };
  });
}
```

**`HistoryServise.ts`（削除）**: `PracticeUseCase` だけが使っており、存在確認と保存の調整はユースケースへ移る（§5.8）。削除後に `grep -rn "HistoryServise" packages/backend/src` が 0 件であることを確認する。

### 5.5 `src/interfaces/infra/HistoryInfra.ts`（変更）

- `sql` を `kysely` から import する（以下の ID・学習日の SQL 式で使用）。
- 行から `History` を作る処理を 1 か所にまとめる（`findByClientAttemptId` と `listByUidAndQid` で共用）。SELECT する列:
  ``sql<string>`CAST(histories.id AS CHAR)`.as("history_id_text")``、`histories.client_attempt_id`、`quizzes.qid`、`users.uid`、`histories.judgement`、`histories.pressed_word`、`histories.practiced`、`histories.practice_mode`、``sql<string | null>`DATE_FORMAT(histories.study_date, '%Y-%m-%d')`.as("study_date")``、`histories.daily_attempt_number`、`histories.previous_judgement`、`histories.review_state`、`histories.next_review_at`、`histories.review_settings_version`。`History` の `id` には `BigInt(row.history_id_text)` を渡す。`CAST(... AS CHAR)` は、mysql2 が BIGINT を `number` に変換する経路を避けるために必要。並び順は DB 上の `histories.id` を使う。
  `user_quiz_states` にも `next_review_at` があるので、列名は必ず `histories.` で修飾する。
- 対応付け: `studyDayPlacement` は `study_date` と `daily_attempt_number` の両方が非 NULL のときだけ作る。`reviewOutcome` は `practice_mode`・`review_state`・`next_review_at`・`review_settings_version` がすべて非 NULL のときだけ作る（`previous_judgement` は NULL でよい）。
- `findByClientAttemptId` を `private` から公開メソッドに変える。
- `listByUidAndQid`: `users.uid` と `quizzes.qid` で絞り、`.orderBy("histories.practiced").orderBy("histories.id")`。
- `add`: `user_id`・`quiz_id` を別の SELECT で引かず、`insertInto("histories").columns([...]).expression(...)` の INSERT … SELECT 1 文にする。SELECT 側は `users` と `quizzes` を `innerJoin("quizzes", (join) => join.onTrue())` で結び、`users.uid`・`quizzes.qid` で絞り、保存する値は `eb.val(...)` で渡す。ユーザーか問題が無いと SELECT が 0 行になり何も保存されないので、`numInsertedOrUpdatedRows !== 1n` なら `new NoResultError(query.toOperationNode())` を投げる（従来の ID 検索と同じ例外にし、呼び出し側の「削除された親」の判定を変えない）。`study_date` は Date にせず暦日の文字列のまま渡す。INSERT する列に `practice_mode`（`history.mode`）、`study_date`・`daily_attempt_number`（`history.studyDayPlacement`）、`previous_judgement`・`review_state`・`next_review_at`・`review_settings_version`（`history.reviewOutcome`）を足す。いずれも元が `null` なら `null`。`executeTakeFirstOrThrow()` の `insertResult.insertId`（`bigint | undefined`）を変換せず返す。`undefined` なら例外を投げる。
- `add` のエラー処理を次のとおり変える。

```ts
    } catch (error) {
      const isDuplicateKey =
        error instanceof Error && "code" in error && error.code === "ER_DUP_ENTRY";
      // 旧形式の履歴（clientAttemptId が null）は再送の識別に使えないので、変換しない。
      if (!isDuplicateKey || history.clientAttemptId === null) throw error;
      // どの一意制約に当たったかをメッセージ文字列で見分けない。呼び出し側が
      // clientAttemptId で読み直し、見つからなければ cause を投げ直す。
      throw new DuplicateClientAttemptError(error);
    }
```

- `assignStudyDayPlacements`: 1 件ずつ `UPDATE histories SET study_date = ?, daily_attempt_number = ? WHERE id = ? AND daily_attempt_number IS NULL`。ID の条件値は ``sql<number>`CAST(${assignment.historyId.toString()} AS UNSIGNED)` ``として渡し、`Number(assignment.historyId)` は使わない。
- `listAnsweredPairs`: `histories` を `users`・`quizzes` に JOIN し、`.select(["users.uid", "quizzes.qid"]).distinct()`、`after` があれば `(users.uid > after.uid) OR (users.uid = after.uid AND quizzes.qid > after.qid)`、`.orderBy("users.uid").orderBy("quizzes.qid").limit(limit)`。

### 5.6 `src/domains/UserQuizState/IUserQuizStateRepository.ts`（変更）と `src/interfaces/infra/UserQuizStateInfra.ts`（変更）

インターフェースに 1 メソッド追加する。

```ts
  /**
   * 行が無ければ未学習の状態で作り、排他ロックして返す。トランザクション内でだけ呼べる。
   * 同じユーザー・問題への解答は、このロックを取った順に処理される。
   */
  findOrCreateForUpdate(uid: string, qid: string): Promise<UserQuizState>;
```

`UserQuizStateInfra` の実装:

```ts
  async findOrCreateForUpdate(uid: string, qid: string) {
    const client = this.clientManageer.getClient();
    if (!client.isTransaction) {
      throw new Error("Locking a review state requires a transaction");
    }
    const { userId, quizId } = await this.resolveIds(uid, qid);
    const unlearned = UserQuizState.create(uid, qid);

    // 先に SELECT ... FOR UPDATE しないのは、行が無いとギャップロックになり、
    // 同時に来た初回解答どうしがデッドロックするため。先に行を必ず存在させる
    // （https://dev.mysql.com/doc/refman/9.1/en/innodb-locks-set.html ）。
    await client
      .insertInto("user_quiz_states")
      .values({
        user_id: userId,
        quiz_id: quizId,
        state: unlearned.state,
        review_count: unlearned.reviewCount,
        success_streak: unlearned.successStreak,
        interval_days: unlearned.intervalDays,
        last_reviewed_at: null,
        next_review_at: null, // 未学習なので期限なし
        fsrs_memory: null,
        updated_at: dayjs().toDate(),
      })
      .onDuplicateKeyUpdate({ user_id: userId })
      .execute();

    const locked = await client
      .selectFrom("user_quiz_states")
      .select([
        "state",
        "review_count",
        "success_streak",
        "interval_days",
        "last_reviewed_at",
        "next_review_at",
        "fsrs_memory",
      ])
      .where("user_id", "=", userId)
      .where("quiz_id", "=", quizId)
      .forUpdate()
      .executeTakeFirstOrThrow();

    return new UserQuizState(
      uid,
      qid,
      locked.state,
      locked.review_count,
      locked.success_streak,
      locked.interval_days,
      locked.last_reviewed_at,
      locked.next_review_at,
      deserializeFsrsMemory(locked.fsrs_memory),
    );
  }
```

- `resolveIds(uid, qid)` は「`users` と `quizzes` から `id` を引く 2 つの SELECT」を private メソッドに切り出したもの。`findOrCreateForUpdate` だけが使う（親が無ければ `NoResultError` になり、404 の判定に使われる）。
- `save` は、`findOrCreateForUpdate` でロックした行を同じトランザクションの中で上書きするだけにする。`updateTable("user_quiz_states").set({ state, review_count, success_streak, interval_days, last_reviewed_at, next_review_at, fsrs_memory, updated_at })` の 1 文で、`user_id`・`quiz_id` は `where("user_id", "=", (eb) => eb.selectFrom("users").select("id").where("uid", "=", uid))` のようにサブクエリで引く。`numUpdatedRows !== 1n` なら（mysql2 は既定で一致した行数を返すので、値が変わらなくても 1）、行が無いとして例外を投げる。INSERT はしない。
  - 行を作るのは `findOrCreateForUpdate` だけにする。`save` が行を作れると、ロックを取らずに呼んだ場合に他の解答の更新を黙って上書きし得るため。インターフェースの doc に「ロックした行を上書きする。ロックや同時更新の確認はしない。行が無ければ例外」と書く。
  - 時刻は `ReviewService` が秒へ切り捨て済みなので、リポジトリでは加工しない（`MysqlReviewTimeNormalizer` は `createReviewService` だけが使う）。履歴と習熟状態に同じ値が入る。
  - `InMemory/UserQuizStateInfra.ts` の `save` も、キーが無ければ同じ例外を投げる。
- Kysely 0.29.8 の書き方の根拠: `forUpdate()`（"Adds the `for update` modifier to a select query on supported databases." https://github.com/kysely-org/kysely/blob/v0.29.8/src/query-builder/select-query-builder.ts ）、`onDuplicateKeyUpdate(update)`（"This is only implemented by some dialects like MySQL." 例は `.onDuplicateKeyUpdate({ updated_at: ... })` https://github.com/kysely-org/kysely/blob/v0.29.8/src/query-builder/insert-query-builder.ts ）。同じ書き方の既存例: `src/interfaces/infra/UserInfra.ts` の `lockRegistration`。

### 5.7 `src/domains/GrowthEvent/`（新規）と `src/interfaces/infra/GrowthEventInfra.ts`（新規）

**`src/domains/GrowthEvent/index.ts`（新規）**

```ts
export const GROWTH_EVENT_TYPES = [
  "FIRST_CORRECT",
  "REVENGE_SUCCESS",
  "REVIEW_SUCCESS",
] as const;
export type GrowthEventType = (typeof GROWTH_EVENT_TYPES)[number];

const CORRECT = 1;

export type AnswerForGrowthEvents = Readonly<{
  judgement: number;
  /** 直前の解答の判定。初回解答は null。 */
  previousJudgement: number | null;
  hasCorrectAnswerBefore: boolean;
  /** 解答直前に既にあった復習期限。初回解答は null（解答後に作られる期限は使わない）。 */
  previousDueAt: Date | null;
  answeredAt: Date;
}>;

/**
 * 1 つの確定解答で成立した成果 1 件。記録した後は変わらない。
 * ユーザーと問題を持たないのは、属する解答（履歴）から決まり、別に持つと食い違い得るため。
 */
export default class GrowthEvent {
  constructor(
    private _type: GrowthEventType,
    private _historyId: bigint,
    private _occurredAt: Date,
  ) {}

  /** 解答直前の履歴・状態に対して判定し、GROWTH_EVENT_TYPES の順で返す。 */
  static detect(
    answer: AnswerForGrowthEvents,
    historyId: bigint,
  ): GrowthEvent[] {
    if (answer.judgement !== CORRECT) return [];
    const isFirstCorrect = !answer.hasCorrectAnswerBefore;
    const isRevenge =
      answer.previousJudgement !== null && answer.previousJudgement !== CORRECT;
    const isDueReview =
      answer.previousDueAt !== null &&
      answer.previousDueAt.getTime() <= answer.answeredAt.getTime();
    return GROWTH_EVENT_TYPES.filter(
      (type) =>
        (type === "FIRST_CORRECT" && isFirstCorrect) ||
        (type === "REVENGE_SUCCESS" && isRevenge) ||
        (type === "REVIEW_SUCCESS" && isDueReview),
    ).map((type) => new GrowthEvent(type, historyId, answer.answeredAt));
  }

  get type(): GrowthEventType {
    return this._type;
  }

  get historyId(): bigint {
    return this._historyId;
  }

  get occurredAt(): Date {
    return this._occurredAt;
  }
}
```

判定に履歴 ID が要るのは、イベントが属する解答を持たせるため。そのため判定は、履歴を保存して ID が決まった後に行う（§5.8）。

**`src/domains/GrowthEvent/IGrowthEventRepository.ts`（新規）**

```ts
import type GrowthEvent from "./index.js";
import type { GrowthEventType } from "./index.js";

export default interface IGrowthEventRepository {
  /** ユーザーと問題は、各イベントが属する履歴の値で保存する。 */
  insertAll(events: readonly GrowthEvent[]): Promise<void>;
  /** FIRST_CORRECT、REVENGE_SUCCESS、REVIEW_SUCCESS の順で返す。 */
  listTypesByHistoryId(historyId: bigint): Promise<GrowthEventType[]>;
}
```

**`src/interfaces/infra/kysely/unsignedId.ts`（新規）**: BIGINT UNSIGNED の ID を SQL の値にする `toUnsignedId(id: bigint)` を置き、``sql<number>`CAST(${id.toString()} AS UNSIGNED)` ``を返す。SQL の束縛値は 10 進文字列なので、`number` に丸められない。

**`src/interfaces/infra/GrowthEventInfra.ts`（新規）**: `sql` を `kysely` から import し、コンストラクターは `(private clientManager: KyselyClientManager)`。

- `insertAll(events)`: イベントごとに `insertInto("growth_events").columns(["user_id", "quiz_id", "history_id", "type", "occurred_at"]).expression(...)` の INSERT … SELECT を実行する。SELECT 側は `histories` から `user_id`・`quiz_id`・`id` を読み、`type` と `occurred_at` は ``sql`${event.type}` ``・``sql`${event.occurredAt}` ``で渡し、`where("id", "=", toUnsignedId(event.historyId))` で絞る。空配列なら何も実行しない。
  - `user_id`・`quiz_id` を `uid`・`qid` から引き直さず履歴から読むのは、履歴と食い違う組を保存し得ないようにするため。
  - 履歴が無いと SELECT が 0 行になり、外部キー違反にならずに黙って何も保存されないので、`numInsertedOrUpdatedRows !== 1n` なら例外を投げる。
- `listTypesByHistoryId`: `SELECT type FROM growth_events WHERE history_id = ? ORDER BY type`。ID の条件値は `toUnsignedId(historyId)`。MySQL の ENUM は定義順で並ぶので、`GROWTH_EVENT_TYPES` と同じ順になる。
- `InMemory/GrowthEventInfra.ts` は `historyId` ごとに `GrowthEvent[]` を保持する。
- この `sql<T>` はインストール済みの Kysely `0.29.8` で SQL 式の結果型を伝えるための型指定で、JavaScript の `number` への変換ではない。`sql` テンプレートの `${...}` はパラメーターとして束縛される。一次情報: Kysely API「Sql」 https://kysely-org.github.io/kysely-apidoc/interfaces/Sql.html 。

### 5.8 `src/applications/usecases/PracticeUseCase.ts`（変更）

メソッド名 `addPractice` と引数 5 つの並びは変えない（`src/app.test.ts` がこの形で検証している。改名は依頼の範囲外）。コンストラクターから `IUserRepository` を外す（認証済みユーザーの存在は、各リポジトリが `user_id` を引くときに保証される。無ければ例外 = 500 で、現行と同じ）。

```ts
import ITransactionManager from "../shared/ITransactionManager.js";
import ReviewService from "../services/ReviewService.js";
import DuplicateClientAttemptError from "@/domains/History/DuplicateClientAttemptError.js";
import IHistoryRepository from "@/domains/History/IHistoryRepository.js";
import History, { placeOnStudyDays } from "@/domains/History/index.js";
import IGrowthEventRepository from "@/domains/GrowthEvent/IGrowthEventRepository.js";
import GrowthEvent, {
  type GrowthEventType,
} from "@/domains/GrowthEvent/index.js";
import IQuizRepository from "@/domains/Quiz/IQuizRepository.js";
import IUserQuizStateRepository from "@/domains/UserQuizState/IUserQuizStateRepository.js";
import {
  CURRENT_REVIEW_SETTINGS_VERSION,
  toReviewJudgement,
} from "@/domains/UserQuizState/ReviewScheduler.js";
import type { QuizLearningState } from "@/domains/UserQuizState/index.js";
import { NoResultError } from "kysely";

export type PracticeAttemptResult = {
  /** histories.id の 10 進文字列。 */
  attemptId: string;
  qid: string;
  judgement: number;
  /** サーバーが確定した解答時刻（ISO 8601、UTC）。 */
  practicedAt: string;
  /** FSRS 接続前に保存された解答の再送では null。 */
  outcome: {
    previousJudgement: number | null;
    review: { state: QuizLearningState; nextReviewAt: string };
    growthEvents: GrowthEventType[];
    studyDate: string;
    dailyAttemptNumber: number;
  } | null;
};

type PracticeErrorCode = "CLIENT_ATTEMPT_ID_CONFLICT" | "QUIZ_NOT_FOUND";
type AddPracticeResult =
  | { ok: true; data: PracticeAttemptResult }
  | { ok: false; error: { code: PracticeErrorCode; message: string } };

const CORRECT = 1;

const laterOf = (instant: Date, other: Date | null) =>
  other !== null && other.getTime() > instant.getTime() ? other : instant;

const isMissingParentError = (error: unknown): boolean =>
  error instanceof NoResultError ||
  (error instanceof Error &&
    "code" in error &&
    error.code === "ER_NO_REFERENCED_ROW_2");

export default class PracticeUseCase {
  constructor(
    private transactionManager: ITransactionManager,
    private quizRepository: IQuizRepository,
    private historyRepository: IHistoryRepository,
    private userQuizStateRepository: IUserQuizStateRepository,
    private growthEventRepository: IGrowthEventRepository,
    private reviewService: ReviewService,
  ) {}

  async addPractice(
    uid: string,
    qid: string,
    judgement: number,
    pressedWordPosition: number,
    clientAttemptId: string,
  ): Promise<AddPracticeResult> {
    const requested = new History(
      qid,
      uid,
      pressedWordPosition,
      judgement,
      new Date(),
      clientAttemptId,
      null,
      "FREE",
    );

    const savedResult = await this.findSavedAttemptResult(requested);
    if (savedResult) return savedResult;

    const canonicalRequest = await this.resolveCanonicalRequest(requested);
    if (!canonicalRequest) {
      return {
        ok: false,
        error: {
          code: "QUIZ_NOT_FOUND",
          message: "指定された問題が見つかりません",
        },
      };
    }

    try {
      const confirmed = await this.transactionManager.begin(
        () => this.recordNewAttempt(canonicalRequest),
        // 既定の REPEATABLE READ だと、ロック待ちの前に読んだスナップショットを使い続け、
        // 先に確定した解答が見えない
        // （https://dev.mysql.com/doc/refman/9.1/en/innodb-transaction-isolation-levels.html ）。
        { isolationLevel: "read committed" },
      );
      return { ok: true, data: confirmed };
    } catch (error) {
      if (error instanceof DuplicateClientAttemptError) {
        // 同じ clientAttemptId の同時送信に負けた。勝った側は確定済みなので読み直す。
        const winner = await this.findSavedAttemptResult(canonicalRequest);
        if (!winner) {
          // 勝者の確定後に問題が削除されると、履歴も連鎖削除される。
          if (!(await this.quizRepository.findByQid(qid))) {
            return {
              ok: false,
              error: {
                code: "QUIZ_NOT_FOUND",
                message: "指定された問題が見つかりません",
              },
            };
          }
          throw error.cause;
        }
        return winner;
      }
      // 問題が存在確認の後に削除された場合だけ 404 にする。他の DB エラーは隠さない。
      if (
        isMissingParentError(error) &&
        !(await this.quizRepository.findByQid(qid))
      ) {
        return {
          ok: false,
          error: {
            code: "QUIZ_NOT_FOUND",
            message: "指定された問題が見つかりません",
          },
        };
      }
      throw error;
    }
  }

  private async resolveCanonicalRequest(
    requested: History,
  ): Promise<History | null> {
    const quiz = await this.quizRepository.findByQid(requested.qid);
    if (!quiz) return null;
    return new History(
      quiz.qid,
      requested.uid,
      requested.pressedWordPosition,
      requested.judgement,
      requested.practicedAt,
      requested.clientAttemptId,
      null,
      requested.mode,
    );
  }

  private async findSavedAttemptResult(
    requested: History,
  ): Promise<AddPracticeResult | null> {
    return this.transactionManager.begin(
      async () => {
        if (requested.clientAttemptId === null) {
          throw new Error("Requested attempt has no clientAttemptId");
        }
        const saved = await this.historyRepository.findByClientAttemptId(
          requested.uid,
          requested.clientAttemptId,
        );
        if (!saved) return null;
        const canonicalRequest = await this.resolveCanonicalRequest(requested);
        return this.replaySavedAttempt(saved, canonicalRequest ?? requested);
      },
      { isolationLevel: "repeatable read" },
    );
  }

  private async recordNewAttempt(
    requested: History,
  ): Promise<PracticeAttemptResult> {
    const { uid, qid, judgement } = requested;
    const savedState = await this.userQuizStateRepository.findOrCreateForUpdate(
      uid,
      qid,
    );
    const pastAttempts = await this.historyRepository.listByUidAndQid(uid, qid);
    const previousState = this.reviewService.resolvePreviousState(
      savedState,
      pastAttempts,
    );

    // 時刻をロック取得後に読むのは、確定時刻の順序を処理順と一致させるため。
    const nextState = this.reviewService.scheduleReview(
      previousState,
      toReviewJudgement(judgement),
      laterOf(new Date(), previousState.lastReviewedAt),
    );
    const { lastReviewedAt: practicedAt, nextReviewAt } = nextState;
    if (practicedAt === null || nextReviewAt === null) {
      throw new Error("Scheduled review has no time");
    }

    // 過去の解答と並べて番号を振り、既存履歴の移行と同じ規則にする。
    const placement = placeOnStudyDays([
      ...pastAttempts.map((pastAttempt) => pastAttempt.practicedAt),
      practicedAt,
    ]).at(-1);
    if (placement === undefined) throw new Error("Attempt has no study day");
    const previousJudgement = pastAttempts.at(-1)?.judgement ?? null;

    const confirmed = new History(
      qid,
      uid,
      requested.pressedWordPosition,
      judgement,
      practicedAt,
      requested.clientAttemptId,
      null,
      requested.mode,
      placement,
      {
        previousJudgement,
        reviewState: nextState.state,
        nextReviewAt,
        reviewSettingsVersion: CURRENT_REVIEW_SETTINGS_VERSION,
      },
    );
    const historyId = await this.historyRepository.add(confirmed);
    await this.userQuizStateRepository.save(nextState);
    // 未学習の状態は期限が null なので、初回解答は復習成功にならない（§3.4）。
    const growthEvents = GrowthEvent.detect(
      {
        judgement,
        previousJudgement,
        hasCorrectAnswerBefore: pastAttempts.some(
          (pastAttempt) => pastAttempt.judgement === CORRECT,
        ),
        previousDueAt: previousState.nextReviewAt,
        answeredAt: practicedAt,
      },
      historyId,
    );
    await this.growthEventRepository.insertAll(growthEvents);

    return toPracticeAttemptResult(
      historyId,
      confirmed,
      growthEvents.map((event) => event.type),
    );
  }

  private async replaySavedAttempt(
    saved: History,
    requested: History,
  ): Promise<AddPracticeResult> {
    if (!saved.hasSameAnswer(requested)) {
      return {
        ok: false,
        error: {
          code: "CLIENT_ATTEMPT_ID_CONFLICT",
          message: "同じ clientAttemptId で異なる解答が登録されています",
        },
      };
    }
    if (saved.id === null) throw new Error("Saved history has no id");
    const growthEvents = saved.reviewOutcome
      ? await this.growthEventRepository.listTypesByHistoryId(saved.id)
      : [];
    return {
      ok: true,
      data: toPracticeAttemptResult(saved.id, saved, growthEvents),
    };
  }
}
```

`toPracticeAttemptResult(historyId, history, growthEvents)` は同じファイルのモジュール関数として書く。`attemptId: String(historyId)`、`practicedAt: history.practicedAt.toISOString()`、`outcome` は `history.reviewOutcome` と `history.studyDayPlacement` の両方があるときだけ組み立て、無ければ `null`（`nextReviewAt` は `toISOString()`）。

押さえる点:

- **書き込みトランザクションの外で行うのは読み取りだけ**。保存済み履歴と成長イベントは `findSavedAttemptResult` の `REPEATABLE READ` トランザクションで同じスナップショットから読む。最初の履歴読み取りより前に削除が確定していれば 404、後に削除が確定してもその読み取り時点の完全な結果を 200 として返す。書き込みはすべて `recordNewAttempt` の中にあり、途中で例外が出れば Kysely がロールバックする。履歴だけ・状態だけ・イベントだけが残ることはない。
- `recordNewAttempt` の最初の DB 操作は必ず `findOrCreateForUpdate`。順序を入れ替えない。
- 上のコードの `"FREE"` は、この Issue で保存できるモードが自由演習だけであることを表す（引数 7 番目の `null` は未採番の `id`）。
- 409 のときは何も書いていない（§4.1 の手順 1 の検索で止まるか、`add` の重複キーでロールバックされる）。
- 保存済みの解答の再送では、問題の存在確認より先に §4.1 の手順 1 で応答する。問題が読み取りトランザクションの開始前に削除されていれば履歴も消えているので、手順 2 の 404 になる。
- 新規保存と再送の比較には `QuizInfra.findByQid` が返す DB 保存値の `qid` を使う。これにより、照合順序で同じ問題を指す `"Ab"` と `"ab"` は同じ解答として扱われ、初回・再送の `qid` も同じ保存値になる。要求 qid がどの問題にも解決できず、同じ `clientAttemptId` の履歴だけが見つかった場合は 409 とする。
- 問題の存在確認と `findOrCreateForUpdate` の間の削除は、`NoResultError` または MySQL の外部キーエラーとして表れる。失敗した書き込みトランザクションのロールバック後に問題を再確認し、消えている場合だけ 404 にする。Kysely の `NoResultError` の一次情報: https://kysely-org.github.io/kysely-apidoc/classes/NoResultError.html 。
- 重複キーで勝者が見つからない場合は、問題を読み直す。勝者の確定後に問題削除が確定して履歴も連鎖削除されたなら 404。問題が残っていれば、当日の通し番号の一意制約に当たった場合など別の異常なので、元の DB エラーを投げ直して 500 にする。
- `UnreplayableReviewStateError` と不正な判定値の `RangeError` は捕まえない（500）。
- 問題の所有者は確認しない。現行の解答保存も確認しておらず、この Issue の範囲では変えない。
- 設定の版（`reviewSettingsVersion`）は保存するだけで、応答 JSON には含めない（§6.1 の契約は変えない）。
- 計画作成時に、§5.3・§5.7 のコードと本節の判定の組み立て（`laterOf`、`previousDueAt` の決め方）を一時ファイルで型検査・実行し、「不正解 → 1 分後の正解で 3 種類が成立」「1 件ずつ適用した結果と `replayReviews` の結果が一致」「古い状態は履歴から作り直され、合っている状態は同じインスタンスが返る」を確認済み。

### 5.9 #308 / #315 が後から差し込む位置（この Issue では実装しない）

将来の実装者のためにコードコメントは残さない（期限も担当も無い予定はコメントにしない）。差し込み位置は次のとおりで、PR の説明に書く。

- 入力の追加: `src/interfaces/controllers/Practice/schema.ts` と `addPractice` の引数。モードは追加した識別子の有無からサーバーが決める。クライアントにモードや初回フラグを申告させない。
- 内容一致の比較: `History.hasSameAnswer` に、追加した識別子（`dailySetItemId` など）の有無と値を含める。
- 所有者・問題の一致・当日の日付の検証と進捗の更新: `recordNewAttempt` の中、`findOrCreateForUpdate` の後。保存済み解答の再送は `replaySavedAttempt` で先に応答するので、日付が変わっても拒否されない。

**FSRS 設定機能（Issue 未作成）が後から差し込む位置**（2026-11-19 の決定、§0.2。この Issue では実装しない）:

- 設定の値は、版ごとに追加するだけのテーブルに持つ。版 1 は全ユーザー共通の現在の既定値（`DEFAULT_DESIRED_RETENTION`、`FsrsReviewAlgorithm` の学習ステップ `1m`）とし、`review_settings_version` が 1 の行と NULL の行は、この値で再生する。設定を変えるときは、既存の版の値を更新せず、新しい版を追加する（過去の版の値が変わると、その版で記録した解答を同じ結果に再生できなくなるため）。
- `recordNewAttempt` の中、`findOrCreateForUpdate` の後で、ユーザーの現在の版を読む。その版の値を `scheduleReview` に渡し、同じ版を `review_settings_version` に記録する。`IReviewAlgorithm.schedule` は、すでに目標定着率を引数に取る。
- `PastReview` に版を足し、`replayReviews` は行ごとの版の値で `scheduleReview` を呼ぶ。どの行も記録時と同じ設定で再生されるので、`resolvePreviousState` の照合は件数のままでよい。
- 設定の変更を、すでに決まっている復習期限にさかのぼって反映するかは、設定機能の Issue で決める。さかのぼる場合は、そのユーザーの `user_quiz_states` を、組ごとのロックを取りながら作り直す。
- 定着の判定（`MIN_RETRIEVABILITY_FOR_RETAINED`）は、ユーザーの設定に連動させない。

### 5.10 `src/interfaces/controllers/Practice/PracticeController.ts`（変更）と `src/routes/practice.ts`（変更）

`schema.ts` は変更しない。コントローラーの応答部分を次のとおりにする。

```ts
if (!result.ok) {
  if (result.error.code === "QUIZ_NOT_FOUND") {
    return c.json(result.error, 404);
  }
  return c.json(result.error, 409);
}

return c.json(result.data, 200);
```

ステータスコードを数値リテラルで分けて書くのは、Hono RPC がステータスごとの応答型をフロントエンドへ伝えるため（"If you explicitly specify the status code, such as `200` or `404`, in `c.json()`. It will be added as a type for passing to the client." https://hono.dev/docs/guides/rpc ）。

`routes/practice.ts` の組み立て:

```ts
const kyselyClientManager = new KyselyClientManager();
const practiceUseCase = new PracticeUseCase(
  new KyselyTransactionManager(kyselyClientManager),
  new QuizInfra(kyselyClientManager, new CategoryInfra(kyselyClientManager)),
  new HistoryInfra(kyselyClientManager),
  new UserQuizStateInfra(kyselyClientManager),
  new GrowthEventInfra(kyselyClientManager),
  createReviewService(),
);
```

全リポジトリとトランザクションマネージャーに**同じ `kyselyClientManager`** を渡す。`UserInfra` の import は不要になるので消す。追加する import は `@/interfaces/infra/kysely/KyselyTransactionManager.js`、`@/interfaces/infra/UserQuizStateInfra.js`、`@/interfaces/infra/GrowthEventInfra.js`、`@/interfaces/factories/createReviewService.js`（`createReviewService` は名前付きエクスポート）。

## 6. API 契約

### 6.1 `POST /api/practice`

リクエスト（変更なし）: `{ "qid": string, "judgement": 0 | 1 | 2, "pressedWord": number (-1 以上), "clientAttemptId": uuid }`

| ステータス | 本文                                                          | 意味                                                                | クライアントの扱い                            |
| ---------- | ------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------- |
| 200        | `PracticeAttemptResult`（下記）                               | 新規に確定した、または保存済みの同じ解答の再送                      | 成功。新規と再送で本文は同じ                  |
| 400        | `{ "title": "INVAILD_PARAMS", "type", "status", "detail" }`   | 入力不正                                                            | 入力ミス。同じ内容で再送しない                |
| 401        | `{ "title": "EXPIRED_TOKEN" 等, ... }`                        | 認証エラー（既存の共通処理）                                        | トークン更新・再ログイン                      |
| 404        | `{ "code": "QUIZ_NOT_FOUND", "message": string }`             | 問題が存在しない（削除済みを含む）                                  | 再送しない                                    |
| 409        | `{ "code": "CLIENT_ATTEMPT_ID_CONFLICT", "message": string }` | 同じ `clientAttemptId` で内容（問題・判定・押し位置・モード）が違う | 再送しない                                    |
| 500        | `{ "title": "INTERNAL_PROBLEMS", ... }`                       | サーバー内部エラー（ロック待ちのタイムアウト等を含む）              | **同じ `clientAttemptId` のまま**再送してよい |

- 通信失敗・タイムアウト・5xx は、同じ `clientAttemptId` で再送すれば二重に記録されない。
- 200 の成功ステータスと必須フィールドは変えていない。変わるのは「200 の本文が空 → JSON」と「存在しない問題が 500 → 404」の 2 点。
- 日付の変更を理由に拒否するケースは、この Issue には無い（日替わりセットの解答を受け付けないため）。#308 で専用のエラーコードを追加する。

200 の本文の例（初回不正解の 1 分後に初めて正解した場合）:

```json
{
  "attemptId": "108",
  "qid": "q1",
  "judgement": 1,
  "practicedAt": "2026-11-16T03:01:00.000Z",
  "outcome": {
    "previousJudgement": 0,
    "review": {
      "state": "REVIEWING",
      "nextReviewAt": "2026-11-17T03:01:00.000Z"
    },
    "growthEvents": ["FIRST_CORRECT", "REVENGE_SUCCESS", "REVIEW_SUCCESS"],
    "studyDate": "2026-11-16",
    "dailyAttemptNumber": 2
  }
}
```

- `outcome` は解答を確定した時点の記録で、再送でも同じ値を返す。現在の習熟状態ではない。
- `qid` は要求文字列ではなく、DB に保存された問題 ID。照合順序で同じ問題を指す表記違いの再送でも、初回と同じ `qid` を返す。
- `outcome` が `null` になるのは、FSRS 接続前に保存された解答（`practice_mode` が NULL の履歴）を同じ内容で再送したときだけ。
- `review.state` の `RETAINED` は確定時点の定着推定。現在の定着数を数える用途には使わない（時間経過で下がるため、`ReviewService.estimateRetention(state, now)` で評価時刻ごとに再計算する。利用は #317）。

### 6.2 フロントエンドへの影響

`rpc.api.practice.$post` の応答型が変わる。`packages/frontend/src/features/practice/components/PracticeSceneChanger.tsx` は成功本文を使っておらず、`readResponse` は JSON 本文をそのまま読める。`pnpm typecheck` で型を確認する。応答本文を使った表示（成果演出など）は #316・#317 の範囲。

現行の `savePendingAttempt` はすべての失敗を同じ `catch` で扱い、再送ボタンを出す。§6.1 の契約に合わせ、`packages/frontend/src/utils/client.ts` の既存 `ApiClientError.status` で失敗を分類する。`readResponse` は `{code,message}` 形式の 404・409 も `ApiClientError` に包み、HTTP ステータスを保持する（同ファイルの `HTTP_ERROR` 分岐）。

- `ApiClientError` の `status` が 400・401・404・409 の場合は `saveState` を `"rejected"` にする。通知はステータスに応じて「入力が不正」「ログインが必要」「問題は削除済み」「解答 ID が競合」とし、同じ入力の再送ボタンを出さない。`pendingAttempt` は利用者が操作を選ぶまで保持し、他の判定・絞り込み操作を無効のままにする。
- `packages/frontend/src/features/practice/components/PracticeSaveStatus.tsx` の `state` に `"rejected"` を追加し、`rejectedStatus` と `onDiscard` を受ける。400・404・409 では「この解答を破棄して続ける」を表示する。401 では「ログインし直す」を表示する。`"failed"` のときだけ「もう一度保存する」を表示する。
- `PracticeSceneChanger` の `discardRejectedAttempt` は保存要求を再送しない。400・404・409 で `pendingAttempt.action === "next"` なら、既存の成功後の進行処理（`resumeId` の進捗保存、次の問題または結果画面への遷移）を共有して実行し、正解リストには追加しない。`action === "quit"` なら保存せずホームへ遷移する。401 は `pendingAttempt` を破棄して `/login` へ遷移する。遷移が成功したときだけ `pendingAttempt` を消して `saveState` を `"idle"` にする。問題・演習を切り替える際は §8 の押し位置も初期化する。
- 通信失敗、タイムアウト、5xx、分類できない例外は `"failed"` とし、元の `pendingAttempt.input`（同じ `clientAttemptId`）を保持して再送する。`attempt.recorded` が真で進行処理だけ失敗した場合も、保存済み解答を二重送信せず進行処理だけ再試行する既存の規則を維持する。

破棄操作はサーバーに保存されなかった解答を先へ進める明示的な選択である。拒否後に新しい `clientAttemptId` で自動送信する案は、409 の原因や 404 の削除済み問題を解決せず、意図しない別解答を作り得るため採らない。

## 7. 既存データの引き継ぎ（移行スクリプトと運用手順書）

### 7.1 方針

- 遅延移行（§4.5）があるので、移行スクリプトを実行しなくても解答 API は正しく動く。スクリプトの役割は、(1) まだ解答されていない既存の組にも習熟状態を作り、復習候補の検索（#315・#308）に載せること、(2) 既存の履歴に学習日と当日の通し番号を入れること、(3) 再現できないデータを報告すること。
- 過去の成長イベントは作らない。旧履歴の `practice_mode`・`previous_judgement`・`review_state`・`next_review_at`・`review_settings_version` は NULL のまま（不明）。
- 処理は「ユーザー・問題の組」ごとに 1 トランザクション。解答 API と同じロック・同じ規則を使うので、実行中に新しい解答が来ても、新しい状態を上書きしない。
- 何度実行しても結果は同じ。完了済みの組は何も書かない。中断したら最初から再実行すればよい（完了位置の記録は持たない。完了の判定は §7.4 の検査が 0 件になること）。
- 既定は読み取り専用（何も書かずに件数だけ報告）。`--apply` を付けたときだけ書く。

### 7.2 `src/applications/usecases/LearningRecord/BackfillLearningRecordUseCase.ts`（新規）

1 つの組を処理するユースケース。コンストラクターは `(transactionManager: ITransactionManager, historyRepository: IHistoryRepository, userQuizStateRepository: IUserQuizStateRepository, reviewService: ReviewService)`。

```ts
export type BackfillLearningRecordCommand = Readonly<{
  uid: string;
  qid: string;
  /** false のときは何も書かず、書く予定の内容だけを返す。 */
  shouldApply: boolean;
}>;

export type BackfillLearningRecordReport = Readonly<{
  uid: string;
  qid: string;
  isStateRebuilt: boolean;
  assignedStudyDayCount: number;
  isDeletedPair: boolean;
}>;
```

`execute(command)` の処理:

1. どちらも 1 組ごとにトランザクションを開始する。`shouldApply` が `true` なら `transactionManager.begin(..., { isolationLevel: "read committed" })`、`false` なら `transactionManager.begin(..., { isolationLevel: "repeatable read" })` で以下を行う。後者は読み取り専用で、状態と履歴を同じスナップショットから読むためのもの。正常に処理した組は `isDeletedPair: false` を返す。
2. 保存済みの状態を得る。`true` なら `findOrCreateForUpdate(uid, qid)`。`false` なら `findByUidAndQid(uid, qid)`（ロックも仮の行の作成もしない）。同じトランザクション内で手順 3 の履歴を読む。
3. `listByUidAndQid(uid, qid)` で履歴を古い順に読む。0 件なら何もせず `isDeletedPair: true`、`isStateRebuilt: false`、`assignedStudyDayCount: 0` を返す（組は履歴から列挙するので、0 件になるのは列挙後に親レコードが削除された場合だけ）。
4. 状態: 保存済みの状態が無ければ `UserQuizState.create(uid, qid)` でメモリ内だけに未学習状態を作る。`reviewService.resolvePreviousState(saved ?? unlearned, histories)` を読み取り専用・書き込みの両方で必ず実行する。これで状態行の無い組でも不正な判定値などの再生不能データを `--apply` 前に検出する。戻り値が比較元と別のインスタンスなら「作り直しが必要」。保存済み状態が無い場合も「作り直しが必要」。`true` のときだけ `userQuizStateRepository.save(作り直した状態)`。
5. 学習日: `placeOnStudyDays(histories.map((history) => history.practicedAt))` で全履歴に番号を振り（解答 API と同じ規則）、`studyDayPlacement` が `null` の行について `{ historyId, studyDate, dailyAttemptNumber }` を集め、`true` のときだけ `assignStudyDayPlacements` に渡す。

`UnreplayableReviewStateError` と `RangeError`（不正な判定値）は捕まえずに投げる。呼び出し側のスクリプトが組ごとに捕まえて報告する。

列挙後の削除が手順 2 より先に確定すると、`findOrCreateForUpdate` の `resolveIds` が `NoResultError` を投げる。ID の検索後・仮行の INSERT 前に親が消える場合は MySQL の `ER_NO_REFERENCED_ROW_2` も起こり得る。`execute` はこの 2 種類だけを**トランザクションの外側**で捕まえ、同じ組の `listByUidAndQid` を読み直す。履歴が 0 件なら正常な削除として `isDeletedPair: true`、`isStateRebuilt: false`、`assignedStudyDayCount: 0` を返し、履歴が残っていれば元の例外を投げ直す。その他の DB エラーや再生エラーは常に投げる。トランザクション外で再確認するのは、失敗したトランザクションを先にロールバックし、`READ COMMITTED` の新しい読み取りで削除確定後の状態を見るため。`NoResultError` は Kysely `0.29.8` の公開 API から import する。一次情報: Kysely API「Executable.executeTakeFirstOrThrow」 https://kysely-org.github.io/kysely-apidoc/interfaces/Executable.html および「NoResultError」 https://kysely-org.github.io/kysely-apidoc/classes/NoResultError.html 。

### 7.3 `src/scripts/backfillLearningRecords.ts`（新規）と `package.json` のスクリプト

`packages/backend/package.json` の `scripts` に追加する: `"learning:backfill": "tsx src/scripts/backfillLearningRecords.ts"`

スクリプトの構成は既存の `src/scripts/checkApiIndexes.ts` に合わせる（`try { ... } finally { await db.destroy(); }`、結果は `console.log(JSON.stringify(...))`）。列挙と集計は `runLearningRecordBackfill` 関数へ分け、履歴リポジトリ・移行ユースケース・履歴のない状態を列挙する関数を引数で受け取る。CLI の入口は DB の組み立て・JSON 出力・終了コードの設定を担当する。処理:

1. `process.argv.includes("--apply")` を `shouldApply` とする。
2. `KyselyClientManager` を 1 つ作り、`KyselyTransactionManager`・`HistoryInfra`・`UserQuizStateInfra`・`createReviewService()` で `BackfillLearningRecordUseCase` を組み立てる。
3. `historyRepository.listAnsweredPairs(after, 200)` を、空配列が返るまで `after` を最後の組に進めながら繰り返す。組ごとに `execute` を呼び、`isDeletedPair` が真なら `deletedPairCount` に数えるが `unreplayablePairs` には含めない。`UnreplayableReviewStateError` と `RangeError`（履歴の再生、または壊れた習熟状態の行の読み込みで投げられる）だけを `{ uid, qid, error: メッセージ }` として `unreplayablePairs` に積む。ロック待ちタイムアウト・デッドロック・接続切断・その他の DB 例外は `{ uid, qid, error: メッセージ }` として別の `failedPairs` に積む。失敗した組は書き込みトランザクションがロールバック済みで、他の組の処理は続ける。分類のため、`BackfillLearningRecordUseCase` は履歴再生の `RangeError` 以外を `RangeError` に包み直さない。
4. 履歴が無いのに解答済みの状態を検出する（読み取りのみ）。

   ```sql
   SELECT users.uid, quizzes.qid
   FROM user_quiz_states
   INNER JOIN users ON users.id = user_quiz_states.user_id
   INNER JOIN quizzes ON quizzes.id = user_quiz_states.quiz_id
   WHERE (user_quiz_states.review_count > 0 OR user_quiz_states.last_reviewed_at IS NOT NULL)
     AND NOT EXISTS (
       SELECT 1 FROM histories
       WHERE histories.user_id = user_quiz_states.user_id
         AND histories.quiz_id = user_quiz_states.quiz_id
     )
   ```

5. 最後に 1 行の JSON で要約を出す: `{ shouldApply, pairCount, deletedPairCount, rebuiltStateCount, assignedStudyDayCount, unreplayablePairs: [...], failedPairs: [...], statesWithoutHistory: [...] }`。例外のメッセージを出す際は接続 URL・認証情報を含めない。
6. `unreplayablePairs`、`failedPairs`、`statesWithoutHistory` のいずれかが 1 件でもあれば `process.exitCode = 1`。`failedPairs` は一時的な DB 障害の可能性があるため原因を調べて再実行し、`unreplayablePairs` と `statesWithoutHistory` は元データを確認する。再実行しても完了済みの組の状態は変わらない。

実行方法（リポジトリルート）:

```bash
# 読み取り専用の事前確認
pnpm exec env-cmd -f .config/.env pnpm --filter backend learning:backfill
# 書き込み
pnpm exec env-cmd -f .config/.env pnpm --filter backend learning:backfill --apply
```

### 7.4 運用手順書: `packages/backend/LEARNING_RECORD_MIGRATION.md`（新規）

運用手順は README に直接書かず、`packages/backend/LEARNING_RECORD_MIGRATION.md` に分ける（`API_PERFORMANCE.md` と同じ置き方）。README の「## FSRS・成長イベントの移行」はこのファイルへのリンク 1 行だけにする。本番への適用はこの実装作業では行わない。

前提は、**Docker Compose（`docker-compose.yml` のサービス `app`・`db`）で運用し、アプリを止めたメンテナンス中に移行する**こと。手順書は次の内容を日本語で書く。

1. **対象のマイグレーション**: `20261113000000_add_fsrs_memory`、`20261116000000_add_practice_learning_records`（どちらも列・テーブル・索引の追加だけ）と、`20261124000000_allow_null_review_due`（未学習の行の `next_review_at` を `NULL` にする `UPDATE` を含む。§3.4）。
2. **Docker で動かすときの注意**:
   - `entrypoint.sh` はコマンドが `pnpm run start` のときだけ `migrate:deploy` を実行してからアプリを起動する。新しいイメージを `docker compose up` すると移行スクリプトの前に解答を受け付けるので、メンテナンス中は `docker compose run --rm app <コマンド>` で個別に実行する。
   - 実行用イメージは devDependencies を削除するので `tsx` が無い。移行スクリプトはビルド済みの `node packages/backend/dist/scripts/backfillLearningRecords.js` を `./node_modules/.bin/env-cmd -f .config/.env` 経由で実行する。
   - 標準出力の先頭に `[entrypoint] ...` が出るので、結果は最後の 1 行の JSON を見る。
   - DB 操作は `docker compose exec db` の中で `MYSQL_PWD="$MYSQL_ROOT_PASSWORD"` などコンテナ内の環境変数を使い、秘密情報を画面に出さない。
3. **事前準備**（メンテナンス前）: 切り戻し用に旧イメージへ別名のタグを付ける → `docker compose build app` → 本番のダンプをステージングに復元してリハーサルし、`--apply` の所要時間と再現できないデータを把握する。
4. **当日の手順**: `docker compose stop app` → `mysqldump --add-drop-database --databases` で DB 全体をバックアップ → `migrate:status` で未適用を確認（`20261026000000_api_query_indexes` が残っていれば README「インデックス移行」の事前検査も行う）→ `migrate:deploy` → 確認モード → `--apply` → もう一度確認モードで `rebuiltStateCount` と `assignedStudyDayCount` が 0 → 検証 SQL → `docker compose up -d app`。
5. **切替時点**: 新しいアプリが最初に処理した解答から、FSRS の更新と成長イベントの記録が始まる。**成長イベントの記録開始時点は「そのユーザーの `histories` のうち `practice_mode IS NOT NULL` の行の最小の `practiced`」** と定義する（成長画面 #317 はこれを使って、既存の解答回数の集計とイベント集計の収集範囲が違うことを伝える）。行が無ければ、まだ記録は始まっていない。
6. **エラーの扱い**: `unreplayablePairs`（判定値が 0〜2 以外の履歴や壊れた習熟状態の行など）と `statesWithoutHistory`（履歴が無いのに解答済みの状態）は元データを確認して個別に判断する。スクリプトは推測で補わない。`failedPairs` はロック待ちタイムアウト・接続切断などの処理失敗で、同じコマンドを再実行する。列挙後に削除された組は `deletedPairCount` に数え、エラーにしない。
7. **中止と切り戻し**: 新しいアプリの起動前なら、バックアップを復元して旧イメージで起動し直す（メンテナンス中は誰も書き込まないので失うデータは無い）。DB を戻さずに旧イメージだけを起動する方法は取らない。起動後に問題が見つかった場合は、旧イメージへは戻さず、修正したイメージで再開する。
8. **移行結果のやり直し**: アプリを止めて次を実行し、確認モードからやり直す（習熟状態は履歴から作り直せる。成長イベントと新しい解答の記録は消さない）。

   ```sql
   DELETE FROM user_quiz_states;
   UPDATE histories SET study_date = NULL, daily_attempt_number = NULL WHERE practice_mode IS NULL;
   ```

9. **仕組みの要約**: 組ごとに 1 トランザクション（確認モードは `REPEATABLE READ` で読むだけ、`--apply` は `READ COMMITTED`）。習熟状態は履歴を古い順に再生した結果と一致し、番号は解答 API と同じ `placeOnStudyDays` で振る。解答保存と移行は同じ行ロックで直列化されるので、止めずに移行する場合も整合は保たれるが、旧アプリと新アプリが同時に解答を保存する状態は作らない（旧アプリはロックを取らない）。版 1 の FSRS 設定値は、版を上げずに変えてはいけない。

手順書はこの実装計画を参照せず、それ単体で読める内容にする（この計画ファイルは実装後に残らない前提）。

## 8. フロントエンドの変更: 「やめる」経路で押し位置を保持する

パスは `packages/frontend/` からの相対。

現状、解答ボタンを押して押し位置が取れた後に「演習をやめる」から判定を選ぶと、`PracticeSceneChanger.tsx` が `record(j, -1, "quit")` を呼ぶため、取得済みの押し位置が `-1`（位置不明）で保存される。押し位置は `PracticeQuizController.tsx` のローカル状態 `pressedWord` にしか無いので、親へ伝える。

**`src/features/practice/components/PracticeQuizController.tsx`（変更）**

- `Props` に `onPressedWordChange?: (pressedWord: number) => void;` を追加し、引数の分割代入で受け取る。
- `PracticeTypewriteQuiz` の `onPressed` を次のとおりにする。

  ```tsx
        onPressed={(pressedWord) => {
          setPressedWord(pressedWord);
          onPressedWordChange?.(pressedWord);
        }}
  ```

- `judge` の中で `setPressedWord(-1);` の直後に `onPressedWordChange?.(-1);` を呼ぶ（次の問題へ持ち越さない）。

**`src/features/practice/components/PracticeSceneChanger.tsx`（変更）**

- `pressedWord` は `useRef<{ qid: string; position: number } | null>(null)` で保持する。`PracticeQuizController` の `onPressedWordChange` では、その時表示している `quiz.qid` と通知された位置を一緒に保存する。
- 問題・演習の切替用に `attemptGeneration` state を追加し、切替時に `pressedWord.current = null` と `setAttemptGeneration((generation) => generation + 1)` を実行する。対象は `toFilter`（絞り込みの確定・終了の両方）、保存成功後に次の問題へ進む箇所、結果画面の `onRetry` と `onNext`。`PracticeQuizController` の `key` に `quiz.qid` と `attemptGeneration` を含め、同じ `qid` の問題へ戻った場合も子の `pressedWord` と入力状態を作り直す。`quiz.qid` が props の更新で変わった場合も key により作り直す。
- `PracticeQuitModal` の `onJudge` では、ref の `qid` が現在の `quiz?.qid` と一致するときだけその `position` を使い、それ以外は `-1` を `record(j, position, "quit")` に渡す。`toFilter` で問題番号を 0 に戻しても、前の問題の押し位置を使わない。

押し位置の単位（表示済み問題文の UTF-16 コード単位の長さ）と、`0` が有効な位置で `-1` が位置不明であることは変えない。解答ボタンを押していない状態で「やめる」を選んだ場合は、これまでどおり `-1` が送られる。再送時は `pendingAttempt` に保持した入力をそのまま送る既存の動作で、押し位置も保たれる。

## 9. テスト方針

テストランナーは両パッケージとも Vitest。バックエンドは `describe`・`it`・`expect`・`vi` がグローバル、フロントエンドは `vitest` から import する（既存ファイルに合わせる）。テスト名は「どういう状態で・何をすると・どうなる」が読める日本語または英語にする（同じファイルの既存の言語に合わせる）。期待値は Issue の要件から決め、実装を実行した結果を写さない。内部メソッドの呼び出し回数や順序は検証しない。

### 9.1 新規: ドメインと FSRS の単体テスト（DB 不要）

| ファイル（新規）                                                        | 観点                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/backend/src/domains/GrowthEvent/index.test.ts`                | 不正解・スルーでは何も成立しない／過去に正解が無い正解は初正解、あれば初正解にならない／直前が不正解・スルーの正解はリベンジ、直前が正解または初回ならならない／期限が確定時刻以前なら復習成功、1 秒でも後ならならない、期限が `null`（初回）ならならない／3 種類同時に成立し、順序が固定である                                                                                                                                                                                                                                                                                        |
| `packages/backend/src/domains/UserQuizState/ReviewScheduler.test.ts`    | `IReviewAlgorithm` の代替実装（想起確率を固定で返す）を使う。30 日後の想起確率が `MIN_RETRIEVABILITY_FOR_RETAINED` ちょうどなら定着、わずかに下回れば定着でない、それ以上でも長期復習段階でなければ定着でない／`resolvePreviousState` の 4 つの分岐（§4.5 の表）／`replayReviews` が空配列を拒否する／`toReviewJudgement` が 3 を拒否する                                                                                                                                                                                                                                              |
| `packages/backend/src/interfaces/factories/createReviewService.test.ts` | 実際の FSRS を使う。時刻は固定値を渡す。未学習に不正解 → `needsRelearning` が真、次回期限が 1 分後、状態 `LEARNING`／その 1 分後に正解 → `needsRelearning` が偽、状態 `REVIEWING`、期限が 1 日以上先／スルーも不正解と同じく再学習になる／初回正解は長期復習へ進む／期限前の正解でも解答数と期限が更新される／同じ秒の 2 回目の解答も処理できる／ミリ秒付きの時刻を渡すと `lastReviewedAt` が秒に切り捨てられる／定着と判定された状態を 200 日後に評価すると定着でなくなる／同じ解答列を 1 件ずつ適用した結果と `replayReviews` の結果が一致する／入力の状態オブジェクトが変更されない |
| `packages/backend/src/plugins/day.test.ts`                              | `toStudyDate`: `2026-11-16T14:59:59Z` は `2026-11-16`、`2026-11-16T15:00:00Z` は `2026-11-17`（日本時間 23:59:59 と 0:00:00 の境界）                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `packages/backend/src/domains/History/index.test.ts`                    | `hasSameAnswer`: 問題・判定・押し位置のどれかが違えば偽／モードが両方分かっていて違えば偽／片方のモードが `null` なら他が同じとき真                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

- `packages/backend/src/domains/History/index.test.ts` には `placeOnStudyDays` の観点も入れる: 日付ごとに 1 から数える／境界は UTC ではなく日本時間 0:00／同時刻の解答にも別々の番号を振る／空の入力には空を返す。

### 9.2 新規・変更: リポジトリの単体テスト

- `packages/backend/src/interfaces/infra/HistoryInfra.test.ts`（変更）: 2 番目のテスト「does not acknowledge a duplicate key without a matching saved attempt」は、`add` が既存行を読まなくなったので成り立たない。「重複キーのエラーは、元のエラーを `cause` に持つ `DuplicateClientAttemptError` として投げられる」という内容に書き換える（`rejects.toBeInstanceOf(DuplicateClientAttemptError)` と `cause` の一致）。1 番目（重複キー以外はそのまま伝わる）と 3 番目（`clientAttemptId` が `null` なら元のエラーのまま）は期待が変わらない。モックの `insert` に `executeTakeFirstOrThrow` が必要になった場合はモックだけを足す。
- `add` が INSERT … SELECT になったので、モックではなく、実行した SQL を記録する偽の Driver（`MysqlAdapter`・`MysqlQueryCompiler` を使う本物の Kysely）でテストする。観点: 実行する文は 1 つで、`uid`・`qid` を条件に含む／挿入行数 0 なら `NoResultError` で、`isMissingParentError` が真になる。
- 同ファイルに、`insertId` が `9007199254740993n` のとき `add` が同じ `bigint` を返すことと、`CAST(histories.id AS CHAR)` の読み出し値 `"9007199254740993"` から `History.id` が正確に復元されることを追加する。`Number` への変換を入れると失敗する値で検証する。

### 9.3 新規: ユースケースの単体テスト（DB 不要）

ファイル: `packages/backend/src/applications/usecases/PracticeUseCase.test.ts`（新規）。`MockTransactionManager` と、次のメモリ内リポジトリ（新規、`packages/backend/src/interfaces/infra/InMemory/` に置く。既存の `InMemory/QuizInfra.ts` と同じ流儀）を使う。

- `InMemory/HistoryInfra.ts`: 配列で保持。`add` は `bigint` の連番 ID を返し、同じ `uid` + `clientAttemptId` があれば `DuplicateClientAttemptError`。
- `InMemory/UserQuizStateInfra.ts`: `Map` で保持。`findOrCreateForUpdate` は無ければ `UserQuizState.create` を保存して返す。
- `InMemory/GrowthEventInfra.ts`: `historyId` ごとに種類を保持。

時刻は `vi.useFakeTimers({ toFake: ["Date"] })` と `vi.setSystemTime` で固定する（各テストの最後に `vi.useRealTimers()`）。観点:

- 初回の不正解: `previousJudgement` が `null`、`growthEvents` が空、`dailyAttemptNumber` が 1、`review.state` が `LEARNING`。
- その 1 分後の正解: `growthEvents` が 3 種類、`dailyAttemptNumber` が 2、`previousJudgement` が 0。
- 同じ内容の再送: 本文が初回と完全に一致し、履歴・イベントの件数と習熟状態の解答数が増えない。日付を翌日に進めてから再送しても同じ本文が返り、`studyDate` と `dailyAttemptNumber` が変わらない。
- 同じ `clientAttemptId` で問題・判定・押し位置のどれかを変える: `CLIENT_ATTEMPT_ID_CONFLICT`、保存内容は変わらない。
- DB に保存された `qid` が `"Ab"` の問題へ要求 `"ab"` で保存し、同じ入力を同じ `clientAttemptId` で再送すると、両方 200 で本文が完全に一致し、`qid` はどちらも `"Ab"`。要求 qid が別の問題を指す場合は 409。
- 存在しない問題: `QUIZ_NOT_FOUND`、何も保存されない。
- 新しい解答の保存内容: `reviewOutcome.reviewSettingsVersion` が 1。応答 JSON には版が含まれない。
- `HistoryInfra` が 2^53 を超える ID を返したとき、応答の `attemptId` が正確な 10 進文字列で、`GrowthEventInfra` に渡る `historyId` も同じ `bigint` になる。
- 過去に正解の履歴（モード不明）がある問題を正解: `FIRST_CORRECT` が含まれない。習熟状態の解答数が「過去の履歴件数 + 1」になる（履歴からの再生）。
- 押し位置の識別: 1 日目に位置 50 で不正解 → 同日に位置 20 で正解（`dailyAttemptNumber` 2）→ 翌日に位置 30 で正解（`studyDate` が翌日、`dailyAttemptNumber` 1）。
- 当日初回に正解・押し位置 0 → `dailyAttemptNumber` 1 で保存され、`pressedWordPosition` が 0 のまま。押し位置 -1 の正解もそのまま -1 で保存される。
- FSRS 接続前の履歴（`clientAttemptId` あり、モード `null`）と同じ内容の再送: 200 相当で `outcome` が `null`。
- 履歴が無いのに解答済みの状態がある: 例外が投げられ、履歴が保存されない。

### 9.4 変更・新規: HTTP と MySQL 統合テスト

**`packages/backend/src/app.test.ts`（変更）**

- 「keeps practice, favorite and mylist registration status codes」: `addPractice` のモックの戻り値を `{ ok: true, data: <PracticeAttemptResult の例> }` に変える。ループ内の `expect(await response.text()).toBe("")` は `/api/practice` には当てはまらなくなるので、`/api/practice` だけループから出し、200 と JSON 本文がモックの `data` と一致することを検証する。`toHaveBeenCalledWith(user.uid, "q", 0, 0, "c382ab80-…")` はそのまま通る。
- 追加: `addPractice` が `QUIZ_NOT_FOUND` を返すと 404 と `{ code: "QUIZ_NOT_FOUND" }`、`CLIENT_ATTEMPT_ID_CONFLICT` を返すと 409 になる。

**`packages/backend/src/api.integration.test.ts`（変更・追加）**

- 準備処理の `"--skip-generate",` の行を削除する（Prisma 7 で廃止。"The `--skip-generate` flag was removed in Prisma v7. `db push` no longer runs `prisma generate` automatically." https://www.prisma.io/docs/orm/reference/prisma-cli-reference ）。
- 「acknowledges sequential and concurrent retries…」の `expect(await first.text()).toBe("")` を、JSON 本文の検証（`attemptId` が保存された `histories.id` の文字列と一致する等）に変える。同テストは履歴の `practiced` を直接書き換えてから再送しているので、再送の本文の `practicedAt` が書き換え後の値になることは許容する（検証対象にしない）。
- `beforeEach` のテーブル初期化は変更不要（`growth_events` は `histories`・`quizzes`・`users` の削除で連鎖削除される）。
- 追加する観点（Issue の受入条件に対応）:
  1. 同じ解答の 5 件同時送信で、履歴 1 行・`review_count` 1・イベントが 1 回分。
  2. 同じ秒・同じ問題への異なる `clientAttemptId` 2 件が両方保存され、`review_count` が 2、`daily_attempt_number` が 1 と 2。
  3. 行が無い状態から同じ問題へ異なる `clientAttemptId` 10 件を同時送信し、全件 200、`daily_attempt_number` が 1〜10 で重複なし、`review_count` が 10。
  4. 409 のとき `histories`・`user_quiz_states`・`growth_events` の内容が変わらない。
  5. 保存途中の障害: `GrowthEventInfra.prototype.insertAll` を `vi.spyOn(...).mockRejectedValueOnce(...)` で失敗させると 500 になり、その `clientAttemptId` の履歴も、習熟状態の行も残らない。同じ内容で再送すると 200 で 1 回分だけ保存される。
  6. 不正解 → 1 分後に正解（`vi.useFakeTimers({ toFake: ["Date"] })`）で、`growth_events` に 3 種類が 1 行ずつ入り、再送で増えない。
  7. `beforeEach` が入れている既存履歴（`q1` は不正解 → 正解、モード不明）に対して正解を送ると、`FIRST_CORRECT` が無く、`review_count` が 3 になる。
  8. 問題を削除すると `growth_events` と `histories` が消え、同じ `clientAttemptId` の再送が 404 になる。
  9. 日本時間の日付境界: 23:59:59 と 0:00:00（JST）に同じ問題を解答すると `study_date` が 1 日違い、どちらも `daily_attempt_number` が 1。`study_date` は `DATE_FORMAT` で文字列として読んで比べる。
  10. マイグレーション SQL が適用できる。`db push` で作った DB から `growth_events` テーブル、`histories` の一意索引 `histories_user_id_quiz_id_study_date_daily_attempt_number_key`、追加した 7 列を落とし、`20261116000000_add_practice_learning_records/migration.sql` を `;` で分割して順に実行する（既存の「user quiz state schema」のテストと同じやり方）。実行後、既存の `histories` の行数と値が変わらず、追加列が NULL であること。
  11. 新しい解答の `review_settings_version` が 1 になり、`beforeEach` が入れている既存履歴は NULL のまま。
  12. 問題の存在確認後、`findOrCreateForUpdate` の前に別接続で問題を削除した場合、解答 API は `404 QUIZ_NOT_FOUND` を返し、その解答の履歴・状態・イベントを残さない。ID 解決後、仮行 INSERT 前の外部キーエラー経路も確認する。
  13. 保存済み履歴の読み取り直後、成長イベントの読み取り前に別接続で問題を削除した場合、進行中の再送は削除前の成長イベントを含む初回と同じ 200 本文を返す。削除確定後に新しく始めた再送は 404 になる。2 接続の待機点を使って順序を固定し、`REPEATABLE READ` の同一スナップショットであることを確認する。
  14. 異なる内容の同一 `clientAttemptId` を同時送信し、敗者が重複キーを受けてロールバックした直後に勝者の問題を別接続で削除する。敗者が勝者の履歴を再検索した時点で履歴が無ければ、404 を返し、500 にはならない。
  15. 保存値 `"Ab"` の問題へ要求値 `"ab"` で解答を保存し、同じ `clientAttemptId`・同じ要求値で再送すると、200 本文が完全に一致する。`quizzes.qid` の照合順序を使った検索であることを実 DB で確認する。

### 9.5 新規: 移行ユースケースの統合テスト

`packages/backend/src/api.integration.test.ts` に `describe("learning record backfill", …)` を追加し、`BackfillLearningRecordUseCase` を実際のリポジトリで組み立てて検証する。

- `shouldApply: false` では DB が 1 行も変わらず、報告に作り直しと学習日の件数が出る。
- 読み取り専用確認が保存済みの状態を読んだ直後に、別接続の解答 API が状態と履歴を同時に更新しても、その組の `isStateRebuilt` は偽のまま（確認用の状態・履歴は同じ更新前のスナップショット）。再度確認しても更新後の整合した状態を読む。
- `user_quiz_states` が存在せず履歴に `judgement = 3` がある組は、読み取り専用の `execute` でも `RangeError` になり、スクリプトの `unreplayablePairs` に現れる。`--apply` より前に検出する。
- `listAnsweredPairs` で列挙した直後に問題またはユーザーを削除してから `execute` すると、正常な削除として `isDeletedPair: true` を返し、書き込みはない。`findOrCreateForUpdate` の ID 検索と仮行 INSERT の間に削除が入る場合も同じ扱いとする。スクリプトの `deletedPairCount` は増えるが `unreplayablePairs` は増えず、終了コードは 0。
- `shouldApply: true` で、既存履歴（`q1`: 不正解 → 正解）から `review_count` 2 の状態ができ、`fsrs_memory` が入り、履歴に `study_date` と `daily_attempt_number` が入る。`practice_mode` と `review_settings_version` は NULL のまま、`growth_events` は 0 行。
- 2 回実行しても結果が変わらず、2 回目の報告は作り直し 0・学習日 0。
- 先に API で新しい解答を保存してから実行しても、その解答の状態（`review_count`・`next_review_at`）と `daily_attempt_number` が変わらない。
- 同じ秒の履歴 2 行は `id` の昇順で 1、2 と採番される。
- 判定値が 3 の履歴を含む組を `execute` すると `RangeError` が投げられ、その組の状態と履歴が変わらない。
- 履歴が無いのに `review_count > 0` の状態行は、履歴が無いので `listAnsweredPairs` には現れない。§7.3 の手順 4 の SQL をテスト内で実行し、その行が検出されることを確認する。

`packages/backend/src/scripts/backfillLearningRecords.test.ts`（新規）では、`runLearningRecordBackfill` に偽のリポジトリ・ユースケースを渡して集計を検証する。ロック待ちタイムアウトを模した DB 例外ではその組が `failedPairs` にだけ入り、`unreplayablePairs` は空。判定値 3 の履歴からの `RangeError` は逆に `unreplayablePairs` にだけ入る。どちらも CLI が終了コード 1 にする条件に該当する。実 DB の一時的な障害を再現するために待ち時間を使わない。

### 9.6 変更: フロントエンドのテスト

`packages/frontend/src/features/practice/practice-requests.test.ts`（変更）

- `./components/PracticeQuizController` のモックで、`onPressedWordChange` も `mocks` に保持する（`mocks` に `pressedWordChange` を足す）。
- `./components/PracticeSaveStatus` のモックで `state`・`rejectedStatus`・`onRetry`・`onDiscard` を保持する。400・404・409 の応答では `state: "rejected"` になり、破棄後は同じ `clientAttemptId` を再送せず次の問題へ進む（`action: "quit"` なら保存せずホームへ移る）。401 では再送ボタンを出さずログイン画面へ進む。通信失敗・5xx は `state: "failed"` で、再送時も同じ入力と `clientAttemptId` を使う。拒否時は別の判定や絞り込みで `pendingAttempt` が上書きされないことも確認する。
- 追加: 押し位置 12 を通知してから「やめる」で正解を選ぶと、送信される `pressedWord` が 12 になる。
- 既存の「retries a failed quit…」（押していない状態の「やめる」は `pressedWord: -1`）は変更なしで通ること。
- 追加: 判定後（`onPressedWordChange(-1)` が呼ばれた後）に「やめる」を選ぶと `-1` が送られる。
- 追加: 押し位置 12 を通知した後、保存を伴わず絞り込みで別の問題へ移ると、「やめる」の送信位置は `-1` になる。同じ問題へ戻る場合も `-1` で、子コンポーネントの押し位置が初期化される。結果画面の再挑戦・次ページでも同様に初期化される。

## 10. 品質管理の手順

ルート `AGENTS.md` の「品質管理の実行手順」に従い、リポジトリルートで順に実行する。

1. **整形**: `pnpm fmt:check` を先に実行する。自分が変更していないファイルが差分として挙がる場合は、`pnpm fmt` を使わず `pnpm exec oxfmt <変更したファイルのパス…>` で変更したファイルだけを整形する（`AGENTS.md`: フォーマットは変更したファイルに限定する）。挙がらなければ `pnpm fmt`。整形後に `git status` で、§0.3 の無関係なファイルに差分が増えていないことを確認する。`packages/backend/src/db/types.ts` は整形対象外（`.oxfmtrc.json` の `ignorePatterns`）。
2. **静的解析**: `pnpm lint`。
3. **テスト**: `pnpm test`（両パッケージの通常テスト。統合テストは含まれない）。
4. **型**: `pnpm typecheck`（API の応答型を変えたため必須。バックエンドのビルドとフロントエンドの型検査）。
5. **MySQL 統合テスト**: `pnpm --filter backend test:integration`（Docker が必要。開発コンテナでは `TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal` が設定済み）。§9.4 の `--skip-generate` 削除後に初めて実行できるようになる見込みだが、計画作成時には実行していない。失敗した場合は、準備処理（コンテナ起動・`prisma db push`）の失敗か、テスト本体の失敗かを分けて報告する。準備処理が別の理由で動かない場合は、その内容と、未検証になった §9.4・§9.5 の観点を報告する。
6. **ブラウザでの動作確認**: §11。

実行した検証と結果、実行できなかった検証とその理由を、最終報告に書く。

## 11. ブラウザでの動作確認

### 11.1 準備

1. 確認対象が今の作業ディレクトリのコードであることを確かめる。`git worktree list` で作業ツリーを確認し、`ss -ltnp | grep -E ':(5173|9000)\b'` で既にサーバーが動いていないかを見る。動いている場合、そのプロセスの作業ディレクトリ（`readlink /proc/<PID>/cwd`）が今のディレクトリでなければ、それは別の作業ツリーのコードを配信している。
2. 開発用 DB に §3.3 のマイグレーションが適用済みであること（`pnpm migrate:status`）。
3. リポジトリルートで `pnpm dev` を起動する（バックエンド 9000 番、フロントエンド 5173 番。フロントエンドは `/api` を 9000 番へ転送する）。バックエンドのポートは `src/index.ts` で 9000 固定、転送先は `packages/frontend/vite.config.ts` で固定なので、9000 番を別の作業ツリーが使っている場合はそちらを止めてから起動する。
4. ブラウザで `http://localhost:5173` を開く。**確認用に新しいアカウントを作る**（既存アカウントは問題と解答履歴を持っており、出題される問題と期待値がずれるため）。`/welcome` で「ユーザ名」「パスワード」「パスワード（確認用）」を入力して「登録」し、`/login` でログインする。
5. `/create` で問題をちょうど 2 問作る（問題文は 20 文字以上にすると、途中で解答ボタンを押しやすい）。
6. 開発者ツールの Network タブを開き、`practice` で絞り込む。

### 11.2 確認項目

画面の操作方法（現行の実装）:

- `/practice` を開くと「絞り込み」モーダルが出る。条件を変えずに確定すると演習が始まり、問題文が 1 文字ずつ表示される。出題順はシャッフルされるので、**どの問題への解答かはリクエスト本文の `qid` で見分ける。** 以下では、最初に出た問題を「問題 A」、もう一方を「問題 B」と呼ぶ。
- 問題文の表示中に画面下の大きな解答ボタンを押すと、約 5 秒のカウントダウンの後に判定ボタンが有効になる。左から赤い ○（正解 = `judgement: 1`）、灰色の ≫（スルー = `2`）、青い ✕（不正解 = `0`）。解答ボタンを押した場合は ○ と ✕ だけ、押さずに問題文が最後まで出て約 3 秒経った場合は ≫ だけが押せる。
- 最後の問題を判定すると結果モーダルが出る。「同じ問題群でやりなおす」で同じ問題を同じ順でもう一度解ける。
- 右上の「演習をやめる」（モバイル幅では一時停止アイコン）から、「正解にしてやめる」「スルーにしてやめる」「誤答にしてやめる」を選ぶと、その判定を保存してホームへ移動する。

| #   | 操作                                                                                                                                                                                                | 期待する結果                                                                                                                                                                                                                                                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 演習を開始し、問題 A で解答ボタンを押して ✕（不正解）を押す                                                                                                                                         | `POST /api/practice` が 200。応答本文が JSON で、`outcome.previousJudgement` が `null`、`outcome.growthEvents` が `[]`、`outcome.review.state` が `"LEARNING"`、`outcome.review.nextReviewAt` が `practicedAt` のちょうど 1 分後、`outcome.dailyAttemptNumber` が `1`、`outcome.studyDate` が今日の日本時間の日付。画面は問題 B へ進む |
| 2   | 問題 B は解答ボタンを押して ○（正解）を押す                                                                                                                                                         | 200。`outcome.previousJudgement` が `null`、`outcome.growthEvents` が `["FIRST_CORRECT"]`、`outcome.review.state` が `"REVIEWING"`、`outcome.dailyAttemptNumber` が `1`。結果モーダルが出る                                                                                                                                            |
| 3   | 手順 1 から 1 分以上経ってから「同じ問題群でやりなおす」を押し、問題 A で解答ボタンを押して ○（正解）を押す                                                                                         | 200。`outcome.previousJudgement` が `0`、`outcome.growthEvents` が `["FIRST_CORRECT", "REVENGE_SUCCESS", "REVIEW_SUCCESS"]`、`outcome.review.state` が `"REVIEWING"`、`outcome.dailyAttemptNumber` が `2`                                                                                                                              |
| 4   | 続けて問題 B でも解答ボタンを押して ○（正解）を押す（待たなくてよい）                                                                                                                               | 200。`outcome.previousJudgement` が `1`、`outcome.growthEvents` が `[]`（初正解でもリベンジでもなく、期限も来ていない）、`outcome.dailyAttemptNumber` が `2`、`outcome.review.nextReviewAt` が手順 2 の値より後                                                                                                                        |
| 5   | Network タブで手順 3 のリクエストを右クリックし「Copy as fetch」でコピーして、Console に貼り付けて実行する（同じ `clientAttemptId` の再送）。`await (await fetch(...)).json()` の形にして本文を見る | 200。応答本文が手順 3 と完全に同じ（`attemptId`・`practicedAt`・`growthEvents`・`dailyAttemptNumber` が変わらない）                                                                                                                                                                                                                    |
| 6   | 手順 5 の fetch の本文の `judgement` だけを `0` に書き換えて実行する                                                                                                                                | 409。本文が `{"code":"CLIENT_ATTEMPT_ID_CONFLICT", …}`                                                                                                                                                                                                                                                                                 |
| 7   | 「同じ問題群でやりなおす」でもう一度始め、問題 A の表示中に解答ボタンを押す。判定ボタンは押さずに「演習をやめる」→「正解にしてやめる」を押す                                                        | 送信されたリクエスト本文の `pressedWord` が `0` 以上（押した時点までに表示されていた文字数）で、`-1` ではない。200 の後、ホームへ移動する                                                                                                                                                                                              |
| 8   | もう一度 `/practice` で演習を開始し、解答ボタンを押さずに「演習をやめる」→「スルーにしてやめる」を押す                                                                                              | リクエスト本文の `pressedWord` が `-1`。200 の後、ホームへ移動する                                                                                                                                                                                                                                                                     |
| 9   | `/practice` を再開し、問題 A で解答ボタンを押すが判定はしない。絞り込みを開いて条件を確定し、押し直さずに「演習をやめる」→「スルーにしてやめる」を押す                                              | 切替後に表示された `qid` のリクエストで `pressedWord` が `-1`。同じ `qid` に戻った場合も、前の押し位置を引き継がない                                                                                                                                                                                                                   |
| 10  | `/history`（解答履歴を表示する既存の画面）を開く                                                                                                                                                    | これまでどおり表示され、エラーが出ない                                                                                                                                                                                                                                                                                                 |
| 11  | 開発者ツールの Console を見る                                                                                                                                                                       | 一連の操作で、解答保存に起因するエラーが出ていない                                                                                                                                                                                                                                                                                     |

DB でも確認する場合の SQL（開発用 DB。接続情報は `.devcontainer/dev.env` のものを使い、値を出力に残さない）:

```sql
SELECT id, judgement, pressed_word, practice_mode, study_date, daily_attempt_number,
       previous_judgement, review_state, next_review_at, review_settings_version
FROM histories ORDER BY id DESC LIMIT 5;
SELECT history_id, type, occurred_at FROM growth_events ORDER BY id DESC LIMIT 5;
SELECT user_id, quiz_id, state, review_count, next_review_at, fsrs_memory IS NOT NULL AS has_memory
FROM user_quiz_states ORDER BY updated_at DESC LIMIT 5;
```

期待: 新しい履歴の `practice_mode` が `FREE`、`review_settings_version` が `1`、手順 5 と 6 の操作で行が増えていない、`user_quiz_states.review_count` がその問題の履歴件数と一致する。

移行スクリプトも開発用 DB で確認する: `learning:backfill`（読み取り専用）→ `--apply` → もう一度読み取り専用、の順に実行し、2 回目の読み取り専用で `rebuiltStateCount` と `assignedStudyDayCount` が 0、`unreplayablePairs` と `statesWithoutHistory` が空であること。その後、§7.4 の検証 SQL が 0 件であること。

## 12. 変更対象ファイルの一覧

| パス                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 種別   | 内容                                                                                                                                                                                                                                         | 節               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `packages/backend/prisma/schema.prisma`                                                                                                                                                                                                                                                                                                                                                                                                                         | 変更   | `histories` に 7 列と一意制約、`PracticeMode`・`GrowthEventType`・`growth_events` を追加                                                                                                                                                     | §3.2             |
| `packages/backend/prisma/migrations/20261116000000_add_practice_learning_records/migration.sql`                                                                                                                                                                                                                                                                                                                                                                 | 新規   | 上記のマイグレーション                                                                                                                                                                                                                       | §3.3             |
| `packages/backend/src/db/types.ts`                                                                                                                                                                                                                                                                                                                                                                                                                              | 再生成 | `prisma generate` の出力                                                                                                                                                                                                                     | §3.3             |
| `packages/backend/package.json`                                                                                                                                                                                                                                                                                                                                                                                                                                 | 変更   | `learning:backfill` スクリプトを追加                                                                                                                                                                                                         | §7.3             |
| `packages/backend/README.md`                                                                                                                                                                                                                                                                                                                                                                                                                                    | 変更   | 「FSRS・成長イベントの移行」の節（手順書へのリンク）                                                                                                                                                                                         | §7.4             |
| `packages/backend/LEARNING_RECORD_MIGRATION.md`                                                                                                                                                                                                                                                                                                                                                                                                                 | 新規   | 移行の運用手順書（Docker・メンテナンス中の移行）                                                                                                                                                                                             | §7.4             |
| `packages/backend/prisma/migrations/20261124000000_allow_null_review_due/migration.sql`                                                                                                                                                                                                                                                                                                                                                                         | 新規   | 未学習の `next_review_at` を `NULL` にする                                                                                                                                                                                                   | §3.4             |
| `packages/backend/src/domains/UserQuizState/index.ts`                                                                                                                                                                                                                                                                                                                                                                                                           | 変更   | 未学習の期限を `null` にし、`lastReviewedAt` と `nextReviewAt` の組の不変条件を検査                                                                                                                                                          | §3.4             |
| `packages/backend/src/applications/shared/ITransactionManager.ts`                                                                                                                                                                                                                                                                                                                                                                                               | 変更   | `TransactionOptions` と第 2 引数                                                                                                                                                                                                             | §5.1             |
| `packages/backend/src/interfaces/infra/kysely/KyselyTransactionManager.ts`                                                                                                                                                                                                                                                                                                                                                                                      | 変更   | 分離レベルの指定、入れ子での分離レベルの不一致の検出                                                                                                                                                                                         | §5.1             |
| `packages/backend/src/interfaces/infra/kysely/KyselyClientManager.ts`                                                                                                                                                                                                                                                                                                                                                                                           | 変更   | 実行中のトランザクションと分離レベルの組を保持                                                                                                                                                                                               | §5.1             |
| `packages/backend/src/plugins/day.ts`                                                                                                                                                                                                                                                                                                                                                                                                                           | 変更   | `toStudyDate`                                                                                                                                                                                                                                | §5.2             |
| `packages/backend/src/domains/UserQuizState/ReviewScheduler.ts`                                                                                                                                                                                                                                                                                                                                                                                                 | 変更   | `TARGET_RETENTION` を `DEFAULT_DESIRED_RETENTION` と `MIN_RETRIEVABILITY_FOR_RETAINED` に分割、`CURRENT_REVIEW_SETTINGS_VERSION`、`replayReviews`・`resolvePreviousState`・`toReviewJudgement`・`UnreplayableReviewStateError`・`PastReview` | §5.3             |
| `packages/backend/src/applications/services/ReviewService.ts`                                                                                                                                                                                                                                                                                                                                                                                                   | 変更   | `resolvePreviousState` の委譲                                                                                                                                                                                                                | §5.3             |
| `packages/backend/src/domains/History/index.ts`                                                                                                                                                                                                                                                                                                                                                                                                                 | 変更   | `id`・`mode`・`studyDayPlacement`・`reviewOutcome`（設定の版を含む）、`hasSameAnswer` のモード比較、`placeOnStudyDays`                                                                                                                       | §5.4             |
| `packages/backend/src/domains/History/DuplicateClientAttemptError.ts`                                                                                                                                                                                                                                                                                                                                                                                           | 新規   | 重複送信の例外                                                                                                                                                                                                                               | §5.4             |
| `packages/backend/src/domains/History/IHistoryRepository.ts`                                                                                                                                                                                                                                                                                                                                                                                                    | 変更   | `add` の戻り値、検索・一覧・移行用メソッド                                                                                                                                                                                                   | §5.4             |
| `packages/backend/src/domains/History/HistoryServise.ts`                                                                                                                                                                                                                                                                                                                                                                                                        | 削除   | 役割をユースケースへ移す                                                                                                                                                                                                                     | §5.4             |
| `packages/backend/src/interfaces/infra/HistoryInfra.ts`                                                                                                                                                                                                                                                                                                                                                                                                         | 変更   | 新しい列の読み書き、新メソッド、重複キーの変換、`add` を INSERT … SELECT の 1 文に                                                                                                                                                           | §5.5             |
| `packages/backend/src/domains/UserQuizState/IUserQuizStateRepository.ts`                                                                                                                                                                                                                                                                                                                                                                                        | 変更   | `findOrCreateForUpdate`、`save` の前提（ロック済みの行を上書き、無ければ例外）の doc                                                                                                                                                         | §5.6             |
| `packages/backend/src/interfaces/infra/UserQuizStateInfra.ts`                                                                                                                                                                                                                                                                                                                                                                                                   | 変更   | `findOrCreateForUpdate`、`save` を UPDATE だけに（行が無ければ例外、時刻は加工しない）                                                                                                                                                       | §5.6             |
| `packages/backend/src/domains/GrowthEvent/index.ts`                                                                                                                                                                                                                                                                                                                                                                                                             | 新規   | 種類と `GrowthEvent`（`detect`）                                                                                                                                                                                                             | §5.7             |
| `packages/backend/src/domains/GrowthEvent/IGrowthEventRepository.ts`                                                                                                                                                                                                                                                                                                                                                                                            | 新規   | リポジトリの契約                                                                                                                                                                                                                             | §5.7             |
| `packages/backend/src/interfaces/infra/GrowthEventInfra.ts`                                                                                                                                                                                                                                                                                                                                                                                                     | 新規   | `growth_events` の読み書き（履歴から `user_id`・`quiz_id` を読む INSERT … SELECT）                                                                                                                                                           | §5.7             |
| `packages/backend/src/interfaces/infra/kysely/unsignedId.ts`                                                                                                                                                                                                                                                                                                                                                                                                    | 新規   | `toUnsignedId`（BIGINT UNSIGNED の ID を丸めずに SQL へ渡す）                                                                                                                                                                                | §5.7             |
| `packages/backend/src/applications/usecases/PracticeUseCase.ts`                                                                                                                                                                                                                                                                                                                                                                                                 | 変更   | 一括保存と再送の処理、応答型                                                                                                                                                                                                                 | §5.8             |
| `packages/backend/src/interfaces/controllers/Practice/PracticeController.ts`                                                                                                                                                                                                                                                                                                                                                                                    | 変更   | 200 の JSON、404                                                                                                                                                                                                                             | §5.10            |
| `packages/backend/src/routes/practice.ts`                                                                                                                                                                                                                                                                                                                                                                                                                       | 変更   | 組み立て                                                                                                                                                                                                                                     | §5.10            |
| `packages/backend/src/applications/usecases/LearningRecord/BackfillLearningRecordUseCase.ts`                                                                                                                                                                                                                                                                                                                                                                    | 新規   | 1 組分の移行                                                                                                                                                                                                                                 | §7.2             |
| `packages/backend/src/scripts/backfillLearningRecords.ts`                                                                                                                                                                                                                                                                                                                                                                                                       | 新規   | 移行スクリプト                                                                                                                                                                                                                               | §7.3             |
| `packages/backend/src/interfaces/infra/InMemory/HistoryInfra.ts`・`UserQuizStateInfra.ts`・`GrowthEventInfra.ts`                                                                                                                                                                                                                                                                                                                                                | 新規   | テスト用のメモリ内リポジトリ                                                                                                                                                                                                                 | §9.3             |
| `packages/frontend/src/features/practice/components/PracticeQuizController.tsx`                                                                                                                                                                                                                                                                                                                                                                                 | 変更   | `onPressedWordChange`                                                                                                                                                                                                                        | §8               |
| `packages/frontend/src/features/practice/components/PracticeSceneChanger.tsx`                                                                                                                                                                                                                                                                                                                                                                                   | 変更   | HTTP エラー別の再送・破棄と「やめる」経路で押し位置を送る                                                                                                                                                                                    | §6.2、§8         |
| `packages/frontend/src/features/practice/components/PracticeSaveStatus.tsx`                                                                                                                                                                                                                                                                                                                                                                                     | 変更   | 再送不可エラーの表示と破棄操作                                                                                                                                                                                                               | §6.2             |
| テスト（新規）: `packages/backend/src/domains/GrowthEvent/index.test.ts`、`packages/backend/src/domains/UserQuizState/ReviewScheduler.test.ts`、`packages/backend/src/interfaces/factories/createReviewService.test.ts`、`packages/backend/src/plugins/day.test.ts`、`packages/backend/src/domains/History/index.test.ts`、`packages/backend/src/applications/usecases/PracticeUseCase.test.ts`、`packages/backend/src/scripts/backfillLearningRecords.test.ts` | 新規   |                                                                                                                                                                                                                                              | §9.1、§9.3、§9.5 |
| テスト（変更）: `packages/backend/src/interfaces/infra/HistoryInfra.test.ts`、`packages/backend/src/app.test.ts`、`packages/backend/src/api.integration.test.ts`、`packages/frontend/src/features/practice/practice-requests.test.ts`                                                                                                                                                                                                                           | 変更   |                                                                                                                                                                                                                                              | §9.2、§9.4〜§9.6 |

変更しないもの: `packages/backend/src/interfaces/controllers/Practice/schema.ts`、`packages/backend/src/interfaces/infra/fsrs/` 配下、`packages/backend/prisma/migrations/20261113000000_add_fsrs_memory/`、`packages/frontend/src/routeTree.gen.ts`。

## 13. 受入条件との対応

| Issue の受入条件                                                                               | 満たす仕組み                                                                                                             | 検証               |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| 同一解答の再送・同時再送で、履歴・FSRS の解答数・イベント・進捗が 1 回分                       | `histories` の一意制約 + 重複時のロールバック + 保存済み結果の返却（§5.8）                                               | §9.3、§9.4-1       |
| 同一秒・同一問題への異なる解答 ID は両方保存され、順序に沿って更新                             | 行ロックによる直列化、`id` 順 = 処理順（§4.2）                                                                           | §9.4-2、3          |
| 同じ ID で問題・判定・押した位置を変えると 409、副作用なし                                     | `hasSameAnswer` と事前検索（§5.8）。「セット項目」は #308 で比較対象に追加                                               | §9.3、§9.4-4       |
| 不正解とスルーは再学習、1 分後の正解で長期復習。期限前の正解も更新                             | 既存の FSRS 設定（§1.2）。すべての解答を FSRS に渡す                                                                     | §9.1               |
| 初正解・リベンジ・復習成功が定義どおり、再送で増えない                                         | `GrowthEvent.detect`（§5.7）、`(history_id, type)` の一意制約                                                            | §9.1、§9.3、§9.4-6 |
| 保存途中の障害で一部だけ残らない                                                               | 1 トランザクション（§5.8）                                                                                               | §9.4-5             |
| 過去に正解済みの問題を導入後に正解しても初正解にならない。移行を再実行しても新規解答を失わない | 履歴から正解の有無を判定（§4.6）、同じロックと規則（§4.5、§7）                                                           | §9.3、§9.4-7、§9.5 |
| 自由演習で日替わりセットの問題を解いても完了数は変わらない                                     | この Issue は日替わりの進捗に一切書き込まない（テーブル自体が無い）。#308 は識別子付きの解答でだけ進捗を更新する（§5.9） | #308 で検証        |
| 定着推定が時間経過で下がるケースを扱える                                                       | `ReviewService.estimateRetention(state, now)`（既存）。保存済みの `RETAINED` を現在値に使わない（§6.1）                  | §9.1               |
| 初回 50 で不正解 → 同日 20 で正解は対象外と識別でき、翌日の初回 30 は対象                      | `study_date` と `daily_attempt_number`（§3.2）                                                                           | §9.3               |
| 同日のモード切替・中断再開・別端末でも初回の扱いが変わらず、同時送信で初回が 2 つ生じない      | 通し番号はユーザー・問題・学習日だけで決まる（モードや端末を見ない）。行ロックと一意制約（§3.2、§4.2）                   | §9.4-3             |
| 当日初回に正解し押し位置 0 なら対象、-1 / null なら対象外。再送で順番や判定が変わらない        | 押し位置は受け取った値のまま保存、識別は保存済みの値を返す（§5.8）。「やめる」経路の修正（§8）                           | §9.3、§9.6         |

## 14. 最終報告に含めること

- 段階（§2）ごとの変更点と、どの責務をどこに置いたか。
- 採用しなかった主な案とその理由（PR の説明にも書く）:
  - 再送用の受理記録を別テーブルに持つ案 → ユーザー決定により不採用（§0.2）。
  - `dailySetItemId` を今回から受け付けて 404 で拒否する案 → ユーザー決定により不採用（§0.2）。
  - 既定の分離レベルのまま文の順序で対処する案 → 順序に依存して壊れやすいので `READ COMMITTED` を明示（§4.3）。
  - 一括移行だけに頼り、移行前の解答をエラーにする案 → 遅延移行でバックフィルの完了を待たずに新アプリを開ける。ただし旧アプリの書き込み停止と実行中リクエストの完了確認は必要（§4.5、§7.4）。
  - 解答ごとに FSRS の設定値そのものを JSON で記録する案 → ユーザー決定により、版番号の記録を採用（§0.2）。
- 実行した検証と結果、実行できなかった検証（特に MySQL 統合テスト）とその理由。
- 残るリスク:
  - `HistoryServise.ts` を削除したこと、存在しない問題への解答が 500 から 404 に変わったこと。
  - 他人の問題への解答を拒否していないこと（現行どおり。所有者の検証は #308 が日替わり項目に対して行う）。
  - 本番への適用（マイグレーション、移行スクリプト）は未実施で、`packages/backend/LEARNING_RECORD_MIGRATION.md` の手順に従う別作業であること。
  - 新アプリの書き込み開始後は、同じ DB へ旧アプリから書き込むロールバックを提供しないこと（§7.4）。
  - `practice_mode` の `DAILY_SET`・`SMART_REVIEW` は定義だけで、書き込む経路は #308・#315 で追加すること。
  - `review_settings_version` は今は常に 1 で、版の値を持つテーブルが無いこと。版 1 の設定値（`DEFAULT_DESIRED_RETENTION`、`FsrsReviewAlgorithm` の学習ステップ）は、版を上げずに変えると再生結果が食い違う。この制約はコードコメントと運用手順書（`LEARNING_RECORD_MIGRATION.md`）・`docs/review_scheduler.md` でしか守られない。
  - `docs/review_scheduler.md` の「#4 で接続」「バックフィルを別途用意」の記述が古くなること（この文書は未コミットの作業中ファイルなので、本件では変更しない。更新するかはユーザーに確認する）。
