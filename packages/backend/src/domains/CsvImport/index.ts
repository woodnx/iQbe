export default class CsvImport {
  constructor(
    private _question: string,
    private _answer: string
  ) {}

  get question() {
    return this._question;
  }

  get answer() {
    return this._answer
  }
}