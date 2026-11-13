import dayjs from "@/plugins/day";

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
    private _nextReviewAt: Date,
  ) {}

  static create(uid: string, qid: string) {
    return new UserQuizState(
      uid,
      qid,
      "LEARNING",
      0,
      0,
      1,
      null,
      dayjs().add(1, "day").toDate(),
    );
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
}
