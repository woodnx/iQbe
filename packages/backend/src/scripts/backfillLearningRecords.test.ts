import type { BackfillLearningRecordCommand } from "@/applications/usecases/LearningRecord/BackfillLearningRecordUseCase.js";
import type { AnsweredPair } from "@/domains/History/IHistoryRepository.js";
import {
  hasBackfillProblems,
  runLearningRecordBackfill,
} from "./backfillLearningRecords.js";

const pairs: AnsweredPair[] = [
  { uid: "owner", qid: "q1" },
  { uid: "owner", qid: "q2" },
  { uid: "other", qid: "q1" },
];

/** 一覧を after の次から limit 件ずつ返す偽のリポジトリ。 */
const historyRepository = {
  listAnsweredPairs: async (after: AnsweredPair | null, limit: number) => {
    const start =
      after === null
        ? 0
        : pairs.findIndex(
            (pair) => pair.uid === after.uid && pair.qid === after.qid,
          ) + 1;
    return pairs.slice(start, start + limit);
  },
};

const report = (
  command: BackfillLearningRecordCommand,
  overrides: Partial<{
    isStateRebuilt: boolean;
    assignedStudyDayCount: number;
    isDeletedPair: boolean;
  }> = {},
) => ({
  uid: command.uid,
  qid: command.qid,
  isStateRebuilt: true,
  assignedStudyDayCount: 2,
  isDeletedPair: false,
  ...overrides,
});

describe("runLearningRecordBackfill", () => {
  it("全ての組を処理し、作り直しと学習日の件数を合計する", async () => {
    const commands: BackfillLearningRecordCommand[] = [];

    const summary = await runLearningRecordBackfill(true, {
      historyRepository,
      backfillPair: async (command) => {
        commands.push(command);
        return report(command);
      },
      listStatesWithoutHistory: async () => [],
    });

    expect(commands.map(({ uid, qid }) => ({ uid, qid }))).toEqual(pairs);
    expect(commands.every((command) => command.shouldApply)).toBe(true);
    expect(summary).toMatchObject({
      shouldApply: true,
      pairCount: 3,
      deletedPairCount: 0,
      rebuiltStateCount: 3,
      assignedStudyDayCount: 6,
    });
    expect(hasBackfillProblems(summary)).toBe(false);
  });

  it("列挙後に削除された組は削除件数にだけ数え、問題として扱わない", async () => {
    const summary = await runLearningRecordBackfill(false, {
      historyRepository,
      backfillPair: async (command) =>
        report(command, {
          isDeletedPair: command.qid === "q2",
          isStateRebuilt: command.qid !== "q2",
          assignedStudyDayCount: command.qid === "q2" ? 0 : 1,
        }),
      listStatesWithoutHistory: async () => [],
    });

    expect(summary).toMatchObject({
      deletedPairCount: 1,
      rebuiltStateCount: 2,
      assignedStudyDayCount: 2,
      unreplayablePairs: [],
      failedPairs: [],
    });
    expect(hasBackfillProblems(summary)).toBe(false);
  });

  it("ロック待ちタイムアウトのような DB 例外の組は failedPairs にだけ入り、他の組の処理は続く", async () => {
    const timeout = Object.assign(
      new Error("Lock wait timeout exceeded; try restarting transaction"),
      { code: "ER_LOCK_WAIT_TIMEOUT" },
    );

    const summary = await runLearningRecordBackfill(true, {
      historyRepository,
      backfillPair: async (command) => {
        if (command.qid === "q2") throw timeout;
        return report(command);
      },
      listStatesWithoutHistory: async () => [],
    });

    expect(summary.failedPairs).toEqual([
      { uid: "owner", qid: "q2", error: timeout.message },
    ]);
    expect(summary.unreplayablePairs).toEqual([]);
    expect(summary.rebuiltStateCount).toBe(2);
    expect(hasBackfillProblems(summary)).toBe(true);
  });

  it("不正な判定値の再生による RangeError の組は unreplayablePairs にだけ入る", async () => {
    const invalidJudgement = new RangeError(
      "Review judgement must be 0, 1, or 2",
    );

    const summary = await runLearningRecordBackfill(false, {
      historyRepository,
      backfillPair: async (command) => {
        if (command.uid === "other") throw invalidJudgement;
        return report(command);
      },
      listStatesWithoutHistory: async () => [],
    });

    expect(summary.unreplayablePairs).toEqual([
      { uid: "other", qid: "q1", error: invalidJudgement.message },
    ]);
    expect(summary.failedPairs).toEqual([]);
    expect(hasBackfillProblems(summary)).toBe(true);
  });

  it("履歴の無い解答済みの状態を報告に含める", async () => {
    const summary = await runLearningRecordBackfill(false, {
      historyRepository,
      backfillPair: async (command) => report(command),
      listStatesWithoutHistory: async () => [{ uid: "owner", qid: "q9" }],
    });

    expect(summary.statesWithoutHistory).toEqual([{ uid: "owner", qid: "q9" }]);
    expect(hasBackfillProblems(summary)).toBe(true);
  });
});
