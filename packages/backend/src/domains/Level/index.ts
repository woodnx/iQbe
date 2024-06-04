export default class Level {
  constructor(
    private _value: string,
    private _name: string,
    private _color: string,
  ) {}

  get value() {
    return this._value;
  }

  get name() {
    return this._name;
  }

  get color() {
    return this._color
  }
}
