export class QuizAttachedTags {
  private constructor(
    private _qid: string,
    private _tagLabels: string[],
  ) {}

  static create(qid: string, tagLabels: string[]) {
    return new QuizAttachedTags(qid, tagLabels);
  }

  get qid() {
    return this._qid;
  }

  get tagLabels() {
    return this._tagLabels;
  }
}
