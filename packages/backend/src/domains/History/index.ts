export default class History {
  constructor(
    private _qid: string,
    private _uid: string,
    private _pressedWordPosiston: number | null,
    private _judgement: number,
    private _practicedAt: Date,
    private _clientAttemptId: string | null,
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

  hasSameAnswer(other: History): boolean {
    return (
      this.uid === other.uid &&
      this.qid === other.qid &&
      this.judgement === other.judgement &&
      this.pressedWordPosition === other.pressedWordPosition
    );
  }
}
