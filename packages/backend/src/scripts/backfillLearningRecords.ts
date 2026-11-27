import { pathToFileURL } from "node:url";
import { type Kysely, sql, type Transaction } from "kysely";
import type {
  BackfillLearningRecordCommand,
  BackfillLearningRecordReport,
} from "@/applications/usecases/LearningRecord/BackfillLearningRecordUseCase.js";
import type { DB } from "@/db/types.js";
import type {
  AnsweredPair,
  default as IHistoryRepository,
} from "@/domains/History/IHistoryRepository.js";
import { UnreplayableReviewStateError } from "@/domains/UserQuizState/ReviewScheduler.js";

const PAIR_PAGE_SIZE = 200;

type FailedPair = AnsweredPair & Readonly<{ error: string }>;

export type LearningRecordBackfillSummary = {
  shouldApply: boolean;
  pairCount: number;
  deletedPairCount: number;
  rebuiltStateCount: number;
  assignedStudyDayCount: number;
  unreplayablePairs: FailedPair[];
  failedPairs: FailedPair[];
  statesWithoutHistory: AnsweredPair[];
};

export type LearningRecordBackfillDependencies = Readonly<{
  historyRepository: Pick<IHistoryRepository, "listAnsweredPairs">;
  backfillPair: (
    command: BackfillLearningRecordCommand,
  ) => Promise<BackfillLearningRecordReport>;
  listStatesWithoutHistory: () => Promise<AnsweredPair[]>;
}>;

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

// RangeError は、履歴の再生（不正な判定値・時刻）と、壊れた習熟状態の行の読み込み
// （解答済みなのに期限が無いなど、UserQuizState の不変条件違反）から投げられる。
// どちらも DB の一時的な障害と分け、再実行では直らない元データの問題として報告する。
const isUnreplayableError = (error: unknown) =>
  error instanceof UnreplayableReviewStateError || error instanceof RangeError;

export function hasBackfillProblems(summary: LearningRecordBackfillSummary) {
  return (
    summary.unreplayablePairs.length > 0 ||
    summary.failedPairs.length > 0 ||
    summary.statesWithoutHistory.length > 0
  );
}

export async function runLearningRecordBackfill(
  shouldApply: boolean,
  dependencies: LearningRecordBackfillDependencies,
): Promise<LearningRecordBackfillSummary> {
  const summary: LearningRecordBackfillSummary = {
    shouldApply,
    pairCount: 0,
    deletedPairCount: 0,
    rebuiltStateCount: 0,
    assignedStudyDayCount: 0,
    unreplayablePairs: [],
    failedPairs: [],
    statesWithoutHistory: [],
  };

  let after: AnsweredPair | null = null;
  for (;;) {
    const pairs = await dependencies.historyRepository.listAnsweredPairs(
      after,
      PAIR_PAGE_SIZE,
    );
    if (pairs.length === 0) break;
    for (const { uid, qid } of pairs) {
      summary.pairCount += 1;
      try {
        const report = await dependencies.backfillPair({
          uid,
          qid,
          shouldApply,
        });
        if (report.isDeletedPair) {
          summary.deletedPairCount += 1;
          continue;
        }
        if (report.isStateRebuilt) summary.rebuiltStateCount += 1;
        summary.assignedStudyDayCount += report.assignedStudyDayCount;
      } catch (error) {
        const failedPair = { uid, qid, error: toErrorMessage(error) };
        if (isUnreplayableError(error)) {
          summary.unreplayablePairs.push(failedPair);
        } else {
          summary.failedPairs.push(failedPair);
        }
      }
    }
    after = pairs[pairs.length - 1];
  }

  summary.statesWithoutHistory = await dependencies.listStatesWithoutHistory();
  return summary;
}

/** 履歴が無いのに解答済みの習熟状態。listAnsweredPairs は履歴から列挙するので、ここで別に探す。 */
export async function listStatesWithoutHistory(
  client: Kysely<DB> | Transaction<DB>,
): Promise<AnsweredPair[]> {
  const result = await sql<AnsweredPair>`
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
    ORDER BY users.uid, quizzes.qid`.execute(client);
  return result.rows;
}

async function main() {
  // DB の接続はスクリプトとして実行されたときだけ作る（テストから集計処理だけを読み込むため）。
  const { db } = await import("@/database.js");
  try {
    const [
      { default: KyselyClientManager },
      { default: KyselyTransactionManager },
      { default: HistoryInfra },
      { default: UserQuizStateInfra },
      { createReviewService },
      { default: BackfillLearningRecordUseCase },
    ] = await Promise.all([
      import("@/interfaces/infra/kysely/KyselyClientManager.js"),
      import("@/interfaces/infra/kysely/KyselyTransactionManager.js"),
      import("@/interfaces/infra/HistoryInfra.js"),
      import("@/interfaces/infra/UserQuizStateInfra.js"),
      import("@/interfaces/factories/createReviewService.js"),
      import("@/applications/usecases/LearningRecord/BackfillLearningRecordUseCase.js"),
    ]);
    const clientManager = new KyselyClientManager();
    const historyRepository = new HistoryInfra(clientManager);
    const useCase = new BackfillLearningRecordUseCase(
      new KyselyTransactionManager(clientManager),
      historyRepository,
      new UserQuizStateInfra(clientManager),
      createReviewService(),
    );

    const summary = await runLearningRecordBackfill(
      process.argv.includes("--apply"),
      {
        historyRepository,
        backfillPair: (command) => useCase.execute(command),
        listStatesWithoutHistory: () => listStatesWithoutHistory(db),
      },
    );
    console.log(JSON.stringify(summary));
    if (hasBackfillProblems(summary)) process.exitCode = 1;
  } finally {
    await db.destroy();
  }
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
