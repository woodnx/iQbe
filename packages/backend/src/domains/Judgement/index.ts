export default class Judgement {
  constructor(
    private _right: number,
    private _wrong: number,
    private _through: number,
  ) {}

  get right() {
    return this._right;
  }

  get wrong() {
    return this._wrong;
  }

  get through() {
    return this._through;
  }
}
