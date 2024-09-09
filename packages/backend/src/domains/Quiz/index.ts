export default class Quiz {
  private _total: number;
  private _right: number;

  constructor(
    private _qid: string,
    private _question: string,
    private _answer: string,
    private _wid: string | null,
    private _categoryId: number | null,
    private _subCategoryId: number | null,
    private _creatorUid: string,
    private _visibleUids: string[],
  ) {
    this._total = 0;
    this._right = 0;
  }

  reconstruct(
    qid: string,
    question: string,
    answer: string,
    wid: string | null,
    categoryId: number | null,
    subCategoryId: number | null,
    creatorUid: string,
    visibleUids: string[],
  ) {
    return new Quiz(
      qid,
      question,
      answer,
      wid,
      categoryId,
      subCategoryId,
      creatorUid,
      visibleUids,
    );
  }

  isPublic(): boolean {
    return !!(this.visibleUids.length == 0)
  }

  isPrivate(): boolean {
    return this.visibleUids.includes(this._creatorUid);
  }

  isEditable(uid: string): boolean {
    return uid == this._creatorUid;
  }

  get qid(): string {
    return this._qid;
  }

  get question(): string {
    return this._question;
  }

  get answer(): string {
    return this._answer;
  }

  get wid(): string | null {
    return this._wid;
  }

  get categoryId(): number | null {
    return this._categoryId;
  }

  get subCategoryId(): number | null {
    return this._subCategoryId;
  }

  get total(): number {
    return this._total;
  }

  get right(): number {
    return this._right;
  }

  get creatorUid(): string {
    return this._creatorUid;
  }

  get visibleUids(): string[] {
    return this._visibleUids;
  }
}
