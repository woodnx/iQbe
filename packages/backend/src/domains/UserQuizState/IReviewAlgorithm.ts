import type { ReviewMemory } from "./ReviewMemory.js";

export type ReviewJudgement = 0 | 1 | 2;

export type ReviewSnapshot = Readonly<{
  memory: ReviewMemory | null;
  reviewCount: number;
  intervalDays: number;
  lastReviewedAt: Date | null;
  /** 未学習なら null。 */
  nextReviewAt: Date | null;
}>;

export type ScheduledReview = ReviewSnapshot & {
  memory: ReviewMemory;
  lastReviewedAt: Date;
  nextReviewAt: Date;
};

/** 入力を変更せず、指定時刻で記憶状態・期限・想起確率を計算する契約。 */
export default interface IReviewAlgorithm {
  schedule(
    previous: ReviewSnapshot,
    judgement: ReviewJudgement,
    reviewedAt: Date,
    desiredRetention: number,
  ): ScheduledReview;
  retrievability(snapshot: ReviewSnapshot, at: Date): number;
}
