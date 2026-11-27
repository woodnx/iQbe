import UserQuizState from "@/domains/UserQuizState/index.js";
import ReviewScheduler from "@/domains/UserQuizState/ReviewScheduler.js";
import FsrsReviewAlgorithm from "../infra/fsrs/FsrsReviewAlgorithm.js";
import { createReviewService } from "./createReviewService.js";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
const start = new Date("2026-11-16T03:00:00Z");
const at = (milliseconds: number) => new Date(start.getTime() + milliseconds);
const unlearned = () => UserQuizState.create("owner", "q1");
const dueOf = (state: UserQuizState) => {
  if (state.nextReviewAt === null) throw new Error("No review due date");
  return state.nextReviewAt;
};

describe("createReviewService（実際の FSRS）", () => {
  const service = createReviewService();

  it("未学習の問題に不正解すると、1 分後が期限の再学習になる", () => {
    const next = service.scheduleReview(unlearned(), 0, start);
    expect(next.needsRelearning).toBe(true);
    expect(next.state).toBe("LEARNING");
    expect(next.nextReviewAt).toEqual(at(MINUTE));
  });

  it("不正解の 1 分後に正解すると、1 日以上先が期限の長期復習へ進む", () => {
    const wrong = service.scheduleReview(unlearned(), 0, start);
    const correct = service.scheduleReview(wrong, 1, at(MINUTE));
    expect(correct.needsRelearning).toBe(false);
    expect(correct.state).toBe("REVIEWING");
    expect(dueOf(correct).getTime()).toBeGreaterThanOrEqual(
      at(MINUTE + DAY).getTime(),
    );
  });

  it("スルーも不正解と同じく再学習になる", () => {
    const through = service.scheduleReview(unlearned(), 2, start);
    const wrong = service.scheduleReview(unlearned(), 0, start);
    expect(through.needsRelearning).toBe(true);
    expect(through.state).toBe("LEARNING");
    expect(through.nextReviewAt).toEqual(wrong.nextReviewAt);
  });

  it("初回の正解は長期復習へ進む", () => {
    const correct = service.scheduleReview(unlearned(), 1, start);
    expect(correct.needsRelearning).toBe(false);
    expect(correct.state).not.toBe("LEARNING");
  });

  it("期限前に正解しても、解答数と期限が更新される", () => {
    const first = service.scheduleReview(unlearned(), 1, start);
    const early = service.scheduleReview(first, 1, at(MINUTE));
    expect(dueOf(first).getTime()).toBeGreaterThan(at(MINUTE).getTime());
    expect(early.reviewCount).toBe(first.reviewCount + 1);
    expect(early.nextReviewAt).not.toEqual(first.nextReviewAt);
  });

  it("同じ秒の 2 回目の解答も処理できる", () => {
    const first = service.scheduleReview(unlearned(), 0, start);
    const second = service.scheduleReview(first, 1, start);
    expect(second.reviewCount).toBe(2);
    expect(second.lastReviewedAt).toEqual(start);
  });

  it("ミリ秒付きの時刻は秒に切り捨てて記録する", () => {
    const next = service.scheduleReview(unlearned(), 1, at(1234));
    expect(next.lastReviewedAt).toEqual(at(1000));
  });

  it("定着と判定された状態も、200 日後に評価すると定着でなくなる", () => {
    let state = service.scheduleReview(unlearned(), 1, start);
    let reviewedAt = start;
    for (let count = 0; count < 20; count += 1) {
      if (service.estimateRetention(state, reviewedAt).isRetained) break;
      reviewedAt = dueOf(state);
      state = service.scheduleReview(state, 1, reviewedAt);
    }
    expect(service.estimateRetention(state, reviewedAt).isRetained).toBe(true);
    expect(
      service.estimateRetention(
        state,
        new Date(reviewedAt.getTime() + 200 * DAY),
      ).isRetained,
    ).toBe(false);
  });

  it("1 件ずつ適用した結果と、履歴の再生結果が一致する", () => {
    const reviews = [
      { judgement: 0, practicedAt: start },
      { judgement: 1, practicedAt: at(MINUTE) },
      { judgement: 2, practicedAt: at(MINUTE) },
      { judgement: 1, practicedAt: at(3 * DAY) },
    ];
    const applied = reviews.reduce(
      (state, review) =>
        service.scheduleReview(
          state,
          review.judgement as 0 | 1 | 2,
          review.practicedAt,
        ),
      unlearned(),
    );
    const replayed = new ReviewScheduler(
      new FsrsReviewAlgorithm(),
    ).replayReviews("owner", "q1", reviews);
    expect(replayed).toEqual(applied);
  });

  it("入力の状態オブジェクトを変更しない", () => {
    const previous = service.scheduleReview(unlearned(), 0, start);
    const before = {
      reviewCount: previous.reviewCount,
      nextReviewAt: dueOf(previous).getTime(),
      memory: previous.memory,
    };
    service.scheduleReview(previous, 1, at(MINUTE));
    expect({
      reviewCount: previous.reviewCount,
      nextReviewAt: dueOf(previous).getTime(),
      memory: previous.memory,
    }).toEqual(before);
  });
});
