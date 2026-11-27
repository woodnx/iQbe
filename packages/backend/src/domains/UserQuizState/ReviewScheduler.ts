import dayjs from "@/plugins/day.js";
import type IReviewAlgorithm from "./IReviewAlgorithm.js";
import type { ReviewJudgement, ReviewSnapshot } from "./IReviewAlgorithm.js";
import UserQuizState from "./index.js";

export const RETENTION_HORIZON_DAYS = 30;
export const DEFAULT_DESIRED_RETENTION = 0.9;

// 定着の判定基準をユーザーの目標定着率と連動させないのは、目標を下げたユーザーの
// 「定着」が甘くなり、成長画面の定着数をユーザー間で比べられなくなるため。
export const MIN_RETRIEVABILITY_FOR_RETAINED = 0.9;

// 版を上げずに DEFAULT_DESIRED_RETENTION や FsrsReviewAlgorithm の学習ステップを変えると、
// 過去の解答を再生した結果が保存済みの状態と食い違う（histories.review_settings_version に当時の版を記録している）。
export const CURRENT_REVIEW_SETTINGS_VERSION = 1;

export type PastReview = Readonly<{ judgement: number; practicedAt: Date }>;

/** 解答済みの状態なのに、再生できる解答履歴が無い。推測で記憶モデルを作らないために投げる。 */
export class UnreplayableReviewStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnreplayableReviewStateError";
  }
}

export function toReviewJudgement(judgement: number): ReviewJudgement {
  if (judgement !== 0 && judgement !== 1 && judgement !== 2) {
    throw new RangeError("Review judgement must be 0, 1, or 2");
  }
  return judgement;
}

function validateTime(previous: ReviewSnapshot, now: Date) {
  const nowTime = dayjs(now);
  const lastTime =
    previous.lastReviewedAt === null ? null : dayjs(previous.lastReviewedAt);
  if (
    !nowTime.isValid() ||
    (previous.nextReviewAt !== null &&
      !dayjs(previous.nextReviewAt).isValid()) ||
    (lastTime !== null && !lastTime.isValid())
  ) {
    throw new RangeError("Review dates must be valid");
  }
  if (lastTime !== null && nowTime.isBefore(lastTime)) {
    throw new RangeError("Review time must not precede the last review");
  }
}

/** 学習・定着のルールを担当し、記憶モデルの計算は注入された実装に委譲する。 */
export default class ReviewScheduler {
  constructor(private readonly algorithm: IReviewAlgorithm) {}

  estimateRetention(previous: ReviewSnapshot, now: Date) {
    validateTime(previous, now);
    // 1日24時間として、評価時点から30日後を調べる。
    const future = dayjs.utc(now).add(RETENTION_HORIZON_DAYS, "day");
    if (!future.isValid()) {
      throw new RangeError(
        "Retention horizon is outside the supported date range",
      );
    }
    const retrievability = this.algorithm.retrievability(previous, now);
    const retrievabilityIn30Days = this.algorithm.retrievability(
      previous,
      future.toDate(),
    );
    return {
      retrievability,
      retrievabilityIn30Days,
      isRetained:
        previous.memory?.phase === "review" &&
        retrievabilityIn30Days >= MIN_RETRIEVABILITY_FOR_RETAINED,
    };
  }

  scheduleReview(
    previous: UserQuizState,
    judgement: ReviewJudgement,
    reviewedAt: Date,
  ): UserQuizState {
    toReviewJudgement(judgement);
    validateTime(previous, reviewedAt);
    const next = this.algorithm.schedule(
      previous,
      judgement,
      reviewedAt,
      DEFAULT_DESIRED_RETENTION,
    );
    const { isRetained } = this.estimateRetention(next, reviewedAt);

    return new UserQuizState(
      previous.uid,
      previous.qid,
      judgement !== 1 ? "LEARNING" : isRetained ? "RETAINED" : "REVIEWING",
      next.reviewCount,
      judgement === 1 ? previous.successStreak + 1 : 0,
      next.intervalDays,
      dayjs(next.lastReviewedAt).toDate(),
      dayjs(next.nextReviewAt).toDate(),
      next.memory,
    );
  }

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
      const isUnlearned =
        saved.reviewCount === 0 && saved.lastReviewedAt === null;
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
}
