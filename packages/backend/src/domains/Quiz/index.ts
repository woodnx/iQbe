export default class Quiz {
  private _total: number;
  private _right: number;

  constructor(
    private _qid: string,
    private _question: string,
    private _answer: string,
    private _anotherAnswer: string | null,
    private _tagLabels: string[],
    private _wid: string | null,
    private _categoryId: number | null,
    private _subCategoryId: number | null,
    private _creatorUid: string,
    private _visibleUids: string[],
  ) {
    this._total = 0;
    this._right = 0;
  }

  editQuestion(question: string) {
    this._question = question;
  }

  editAnswer(answer: string) {
    this._answer = answer;
  }

  editAnotherAnswer(anotherAnswer: string | null) {
    this._anotherAnswer = anotherAnswer
  }

  editCategoryId(categoryId: number | null) {
    this._categoryId = categoryId;
  }

  editSubCategoryId(subCategoryId: number | null) {
    this._subCategoryId = subCategoryId;
  }

  editWid(wid: string | null) {
    this._wid = wid;
  }

  editTags(tagLabels: string[]) {
    this._tagLabels = tagLabels;
  }

  addTagLabel(tagLabel: string): string[] {
    return [...this._tagLabels, tagLabel];
  }

  removeTagLabel(tagLabel: string): string[] {
    return this._tagLabels.filter(label => label !== tagLabel);
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

  get anotherAnswer(): string | null {
    return this._anotherAnswer;
  }

  get wid(): string | null {
    return this._wid;
  }

  get tagLabels(): string[] {
    return this._tagLabels;
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
