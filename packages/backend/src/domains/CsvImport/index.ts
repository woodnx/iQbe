export default class CsvImport {
  constructor(
    private _question: string,
    private _answer: string,
    private _anotherAnswer: string | null,
    readonly categoryName?: string,
    readonly subCategoryName?: string,
  ) {}

  get question() {
    return this._question;
  }

  get answer() {
    return this._answer;
  }

  get anotherAnswer() {
    return this._anotherAnswer;
  }
}
