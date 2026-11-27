import { toStudyDate } from "@/plugins/day.js";
import type { QuizLearningState } from "../UserQuizState/index.js";

export type PracticeMode = "FREE" | "DAILY_SET" | "SMART_REVIEW";

/** 日本時間の学習日と、その日の同じ問題への通し番号（1 が当日初回解答）。 */
export type StudyDayPlacement = Readonly<{
  studyDate: string;
  dailyAttemptNumber: number;
}>;

/**
 * 1 組のユーザー・問題の解答時刻（古い順。同時刻は履歴 ID 順）に、日本時間の学習日と
 * その日の通し番号を振る。新しい解答の記録と既存履歴の移行で同じ番号にするため、規則はここだけに置く。
 */
export function placeOnStudyDays(
  practicedAts: readonly Date[],
): StudyDayPlacement[] {
  const attemptCountByDate = new Map<string, number>();
  return practicedAts.map((practicedAt) => {
    const studyDate = toStudyDate(practicedAt);
    const dailyAttemptNumber = (attemptCountByDate.get(studyDate) ?? 0) + 1;
    attemptCountByDate.set(studyDate, dailyAttemptNumber);
    return { studyDate, dailyAttemptNumber };
  });
}

/** 解答を確定した時点の記録。再送にはこれを返し、現在の状態で作り直さない。 */
export type ReviewOutcome = Readonly<{
  previousJudgement: number | null;
  reviewState: QuizLearningState;
  nextReviewAt: Date;
  reviewSettingsVersion: number;
}>;

export default class History {
  constructor(
    private _qid: string,
    private _uid: string,
    private _pressedWordPosiston: number | null,
    private _judgement: number,
    private _practicedAt: Date,
    private _clientAttemptId: string | null,
    private _id: bigint | null = null,
    private _mode: PracticeMode | null = null,
    private _studyDayPlacement: StudyDayPlacement | null = null,
    private _reviewOutcome: ReviewOutcome | null = null,
  ) {}

  get qid(): string {
    return this._qid;
  }

  get uid(): string {
    return this._uid;
  }

  get pressedWordPosition(): number | null {
    return this._pressedWordPosiston;
  }

  get judgement(): number {
    return this._judgement;
  }

  get practicedAt(): Date {
    return this._practicedAt;
  }

  get clientAttemptId(): string | null {
    return this._clientAttemptId;
  }

  get id(): bigint | null {
    return this._id;
  }

  get mode(): PracticeMode | null {
    return this._mode;
  }

  get studyDayPlacement(): StudyDayPlacement | null {
    return this._studyDayPlacement;
  }

  get reviewOutcome(): ReviewOutcome | null {
    return this._reviewOutcome;
  }

  hasSameAnswer(other: History): boolean {
    // FSRS 接続前の履歴はモードが不明（null）なので、モードは両方が分かるときだけ比べる。
    const hasSameMode =
      this.mode === null || other.mode === null || this.mode === other.mode;
    return (
      this.uid === other.uid &&
      this.qid === other.qid &&
      this.judgement === other.judgement &&
      this.pressedWordPosition === other.pressedWordPosition &&
      hasSameMode
    );
  }
}
