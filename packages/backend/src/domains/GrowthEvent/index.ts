export const GROWTH_EVENT_TYPES = [
  "FIRST_CORRECT",
  "REVENGE_SUCCESS",
  "REVIEW_SUCCESS",
] as const;
export type GrowthEventType = (typeof GROWTH_EVENT_TYPES)[number];

const CORRECT = 1;

export type AnswerForGrowthEvents = Readonly<{
  judgement: number;
  /** 直前の解答の判定。初回解答は null。 */
  previousJudgement: number | null;
  hasCorrectAnswerBefore: boolean;
  /** 解答直前に既にあった復習期限。初回解答は null（解答後に作られる期限は使わない）。 */
  previousDueAt: Date | null;
  answeredAt: Date;
}>;

/**
 * 1 つの確定解答で成立した成果 1 件。記録した後は変わらない。
 * ユーザーと問題を持たないのは、属する解答（履歴）から決まり、別に持つと食い違い得るため。
 */
export default class GrowthEvent {
  constructor(
    private _type: GrowthEventType,
    private _historyId: bigint,
    private _occurredAt: Date,
  ) {}

  /** 解答直前の履歴・状態に対して判定し、GROWTH_EVENT_TYPES の順で返す。 */
  static detect(
    answer: AnswerForGrowthEvents,
    historyId: bigint,
  ): GrowthEvent[] {
    if (answer.judgement !== CORRECT) return [];
    const isFirstCorrect = !answer.hasCorrectAnswerBefore;
    const isRevenge =
      answer.previousJudgement !== null && answer.previousJudgement !== CORRECT;
    const isDueReview =
      answer.previousDueAt !== null &&
      answer.previousDueAt.getTime() <= answer.answeredAt.getTime();
    return GROWTH_EVENT_TYPES.filter(
      (type) =>
        (type === "FIRST_CORRECT" && isFirstCorrect) ||
        (type === "REVENGE_SUCCESS" && isRevenge) ||
        (type === "REVIEW_SUCCESS" && isDueReview),
    ).map((type) => new GrowthEvent(type, historyId, answer.answeredAt));
  }

  get type(): GrowthEventType {
    return this._type;
  }

  get historyId(): bigint {
    return this._historyId;
  }

  get occurredAt(): Date {
    return this._occurredAt;
  }
}
