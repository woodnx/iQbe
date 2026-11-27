import GrowthEvent, { type AnswerForGrowthEvents } from "./index.js";

const answeredAt = new Date("2026-11-16T03:01:00Z");
const historyId = 7n;

const answer = (
  overrides: Partial<AnswerForGrowthEvents>,
): AnswerForGrowthEvents => ({
  judgement: 1,
  previousJudgement: 1,
  hasCorrectAnswerBefore: true,
  previousDueAt: new Date("2026-11-20T00:00:00Z"),
  answeredAt,
  ...overrides,
});

const detectTypes = (overrides: Partial<AnswerForGrowthEvents>) =>
  GrowthEvent.detect(answer(overrides), historyId).map((event) => event.type);

describe("GrowthEvent.detect", () => {
  it.each([0, 2])(
    "判定 %i（不正解・スルー）では、他の条件が揃っていても何も成立しない",
    (judgement) => {
      expect(
        detectTypes({
          judgement,
          previousJudgement: 0,
          hasCorrectAnswerBefore: false,
          previousDueAt: answeredAt,
        }),
      ).toEqual([]);
    },
  );

  it("過去に正解が無い問題を正解すると初正解になる", () => {
    expect(
      detectTypes({
        previousJudgement: null,
        hasCorrectAnswerBefore: false,
        previousDueAt: null,
      }),
    ).toEqual(["FIRST_CORRECT"]);
  });

  it("過去に正解がある問題を正解しても初正解にならない", () => {
    expect(detectTypes({})).toEqual([]);
  });

  it.each([0, 2])(
    "直前の判定が %i の問題を正解するとリベンジになる",
    (previous) => {
      expect(detectTypes({ previousJudgement: previous })).toEqual([
        "REVENGE_SUCCESS",
      ]);
    },
  );

  it.each([1, null])("直前の判定が %s ならリベンジにならない", (previous) => {
    expect(detectTypes({ previousJudgement: previous })).toEqual([]);
  });

  it("期限が確定時刻ちょうどなら復習成功になる", () => {
    expect(detectTypes({ previousDueAt: answeredAt })).toEqual([
      "REVIEW_SUCCESS",
    ]);
  });

  it("期限が確定時刻の 1 秒後なら復習成功にならない", () => {
    expect(
      detectTypes({ previousDueAt: new Date(answeredAt.getTime() + 1000) }),
    ).toEqual([]);
  });

  it("期限が無い（初回解答）なら復習成功にならない", () => {
    expect(detectTypes({ previousDueAt: null })).toEqual([]);
  });

  it("3 種類が同時に成立し、順序が固定されている", () => {
    expect(
      detectTypes({
        previousJudgement: 0,
        hasCorrectAnswerBefore: false,
        previousDueAt: new Date("2026-11-16T03:00:00Z"),
      }),
    ).toEqual(["FIRST_CORRECT", "REVENGE_SUCCESS", "REVIEW_SUCCESS"]);
  });

  it("成立したイベントは、属する確定解答と確定時刻を持つ", () => {
    const [event] = GrowthEvent.detect(
      answer({ hasCorrectAnswerBefore: false }),
      historyId,
    );

    expect(event.historyId).toBe(7n);
    expect(event.occurredAt).toBe(answeredAt);
  });
});
