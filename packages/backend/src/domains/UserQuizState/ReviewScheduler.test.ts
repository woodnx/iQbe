import type IReviewAlgorithm from "./IReviewAlgorithm.js";
import type {
  ReviewJudgement,
  ReviewSnapshot,
  ScheduledReview,
} from "./IReviewAlgorithm.js";
import type { ReviewMemory, ReviewPhase } from "./ReviewMemory.js";
import ReviewScheduler, {
  MIN_RETRIEVABILITY_FOR_RETAINED,
  toReviewJudgement,
  UnreplayableReviewStateError,
} from "./ReviewScheduler.js";
import UserQuizState from "./index.js";

const memoryOf = (phase: ReviewPhase): ReviewMemory => ({
  profile: "fake",
  stability: 1,
  difficulty: 5,
  phase,
  learningStep: 0,
  lapses: 0,
  elapsedDays: 0,
});

/** 想起確率を固定で返し、解答のたびに解答数を 1 増やして 1 日後を期限にする代替実装。 */
class FixedReviewAlgorithm implements IReviewAlgorithm {
  constructor(private readonly fixedRetrievability: number) {}

  schedule(
    previous: ReviewSnapshot,
    judgement: ReviewJudgement,
    reviewedAt: Date,
  ): ScheduledReview {
    return {
      memory: memoryOf(judgement === 1 ? "review" : "relearning"),
      reviewCount: previous.reviewCount + 1,
      intervalDays: 1,
      lastReviewedAt: reviewedAt,
      nextReviewAt: new Date(reviewedAt.getTime() + 24 * 60 * 60 * 1000),
    };
  }

  retrievability(): number {
    return this.fixedRetrievability;
  }
}

const now = new Date("2026-11-16T03:00:00Z");
const minutesLater = (minutes: number) =>
  new Date(now.getTime() + minutes * 60 * 1000);

const snapshotIn = (phase: ReviewPhase): ReviewSnapshot => ({
  memory: memoryOf(phase),
  reviewCount: 1,
  intervalDays: 1,
  lastReviewedAt: now,
  nextReviewAt: minutesLater(60 * 24),
});

describe("ReviewScheduler.estimateRetention", () => {
  it("30 日後の想起確率がしきい値ちょうどなら定着と判定する", () => {
    const scheduler = new ReviewScheduler(
      new FixedReviewAlgorithm(MIN_RETRIEVABILITY_FOR_RETAINED),
    );
    expect(
      scheduler.estimateRetention(snapshotIn("review"), now).isRetained,
    ).toBe(true);
  });

  it("30 日後の想起確率がしきい値をわずかに下回れば定着でない", () => {
    const scheduler = new ReviewScheduler(
      new FixedReviewAlgorithm(MIN_RETRIEVABILITY_FOR_RETAINED - 1e-9),
    );
    expect(
      scheduler.estimateRetention(snapshotIn("review"), now).isRetained,
    ).toBe(false);
  });

  it.each(["learning", "relearning"] as const)(
    "想起確率がしきい値以上でも、%s 段階なら定着でない",
    (phase) => {
      const scheduler = new ReviewScheduler(new FixedReviewAlgorithm(1));
      expect(
        scheduler.estimateRetention(snapshotIn(phase), now).isRetained,
      ).toBe(false);
    },
  );
});

describe("ReviewScheduler.resolvePreviousState", () => {
  const scheduler = new ReviewScheduler(new FixedReviewAlgorithm(0.5));
  const pastReviews = [
    { judgement: 0, practicedAt: now },
    { judgement: 1, practicedAt: minutesLater(1) },
  ];

  it("履歴が 0 件で未学習の状態は、そのまま返す", () => {
    const saved = UserQuizState.create("owner", "q1");
    expect(scheduler.resolvePreviousState(saved, [])).toBe(saved);
  });

  it("履歴が 0 件なのに解答済みの状態は、再現不能としてエラーにする", () => {
    const answered = scheduler.scheduleReview(
      UserQuizState.create("owner", "q1"),
      1,
      now,
    );
    expect(() => scheduler.resolvePreviousState(answered, [])).toThrow(
      UnreplayableReviewStateError,
    );
  });

  it("記憶データがあり解答数が履歴件数と一致する状態は、そのまま返す", () => {
    const inSync = scheduler.replayReviews("owner", "q1", pastReviews);
    expect(scheduler.resolvePreviousState(inSync, pastReviews)).toBe(inSync);
  });

  it("解答数が履歴件数と合わない状態は、履歴を再生して作り直す", () => {
    const stale = scheduler.replayReviews(
      "owner",
      "q1",
      pastReviews.slice(0, 1),
    );
    const resolved = scheduler.resolvePreviousState(stale, pastReviews);
    expect(resolved).not.toBe(stale);
    expect(resolved.reviewCount).toBe(2);
    expect(resolved.lastReviewedAt).toEqual(minutesLater(1));
  });

  it("記憶データの無い状態は、履歴を再生して作り直す", () => {
    const unlearned = UserQuizState.create("owner", "q1");
    const resolved = scheduler.resolvePreviousState(unlearned, pastReviews);
    expect(resolved.reviewCount).toBe(2);
    expect(resolved.memory).not.toBeNull();
  });
});

describe("ReviewScheduler.replayReviews", () => {
  it("空の履歴は再生できない", () => {
    const scheduler = new ReviewScheduler(new FixedReviewAlgorithm(0.5));
    expect(() => scheduler.replayReviews("owner", "q1", [])).toThrow(
      RangeError,
    );
  });

  it("0〜2 以外の判定値を含む履歴は再生できない", () => {
    const scheduler = new ReviewScheduler(new FixedReviewAlgorithm(0.5));
    expect(() =>
      scheduler.replayReviews("owner", "q1", [
        { judgement: 3, practicedAt: now },
      ]),
    ).toThrow(RangeError);
  });
});

describe("toReviewJudgement", () => {
  it.each([0, 1, 2])("%i を受け付ける", (judgement) => {
    expect(toReviewJudgement(judgement)).toBe(judgement);
  });

  it.each([3, -1, 1.5])("%s を拒否する", (judgement) => {
    expect(() => toReviewJudgement(judgement)).toThrow(RangeError);
  });
});
