export default class Entity <T> {
  protected readonly _value: T;

  constructor(value: T) {
    this._value = value;
  }
}