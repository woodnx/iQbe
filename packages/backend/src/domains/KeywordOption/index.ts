import ValueObject from "../shared/ValueObject.js";

export default class KeywordOption extends ValueObject<
  0 | 1 | 2,
  "KeywordOption"
> {
  protected validate(value: 0 | 1 | 2): void {}
}
