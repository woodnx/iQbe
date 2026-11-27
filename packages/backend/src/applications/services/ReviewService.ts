import type UserQuizState from "@/domains/UserQuizState/index.js";
import type { ReviewJudgement } from "@/domains/UserQuizState/IReviewAlgorithm.js";
import type ReviewScheduler from "@/domains/UserQuizState/ReviewScheduler.js";
import type { PastReview } from "@/domains/UserQuizState/ReviewScheduler.js";
import type IReviewTimeNormalizer from "../shared/IReviewTimeNormalizer.js";

/**
 * 記録する時刻を確定してからドメインへ渡す。保存トランザクションは呼び出し側が管理する。
 * 秒への切り捨てはここだけで行い、履歴・習熟状態のリポジトリは受け取った時刻をそのまま保存する。
 */
export default class ReviewService {
  constructor(
    private readonly scheduler: ReviewScheduler,
    private readonly timeNormalizer: IReviewTimeNormalizer,
  ) {}

  scheduleReview(
    previous: UserQuizState,
    judgement: ReviewJudgement,
    reviewedAt: Date,
  ) {
    const recordedAt = this.timeNormalizer.normalize(reviewedAt);
    return this.scheduler.scheduleReview(previous, judgement, recordedAt);
  }

  estimateRetention(previous: UserQuizState, now: Date) {
    return this.scheduler.estimateRetention(previous, now);
  }

  resolvePreviousState(
    saved: UserQuizState,
    pastReviews: readonly PastReview[],
  ) {
    return this.scheduler.resolvePreviousState(saved, pastReviews);
  }
}
