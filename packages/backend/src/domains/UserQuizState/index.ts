import type { ReviewMemory } from "./ReviewMemory.js";

export type QuizLearningState =
  // 学習中：知識の獲得・再学習を進めている状態。
  | "LEARNING"
  // 復習中：知識の定着に向けて、間隔を空けた復習を続けている状態。
  | "REVIEWING"
  // 定着推定：復習の実績から定着したと推定される状態。永久的な習得を意味せず、引き続き復習対象となる。
  | "RETAINED";

export default class UserQuizState {
  constructor(
    private _uid: string,
    private _qid: string,
    private _state: QuizLearningState,
    private _reviewCount: number,
    private _successStreak: number,
    private _intervalDays: number,
    private _lastReviewedAt: Date | null,
    /** 未学習（一度も解答していない）なら null。 */
    private _nextReviewAt: Date | null,
    private _memory: ReviewMemory | null = null,
  ) {
    if ((_lastReviewedAt === null) !== (_nextReviewAt === null)) {
      throw new RangeError(
        "A review due date exists only after the first review",
      );
    }
  }

  static create(uid: string, qid: string) {
    return new UserQuizState(uid, qid, "LEARNING", 0, 0, 0, null, null);
  }

  get uid() {
    return this._uid;
  }

  get qid() {
    return this._qid;
  }

  get state() {
    return this._state;
  }

  get reviewCount() {
    return this._reviewCount;
  }

  get successStreak() {
    return this._successStreak;
  }

  get intervalDays() {
    return this._intervalDays;
  }

  get lastReviewedAt() {
    return this._lastReviewedAt;
  }

  get nextReviewAt() {
    return this._nextReviewAt;
  }

  get memory(): ReviewMemory | null {
    return this._memory === null ? null : { ...this._memory };
  }

  // 当日の再出題対象。外部ライブラリの数値状態は扱わない。
  get needsRelearning() {
    return (
      this._memory?.phase === "learning" || this._memory?.phase === "relearning"
    );
  }
}
