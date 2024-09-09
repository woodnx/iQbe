import Tag from "../Tag";
import Quiz from "../Quiz";

export default class TaggedQuiz {
  constructor(
    private _tag: Tag,
    private _quiz: Quiz,
    private _registered: Date,
  ) {}

  get tag() {
    return this._tag;
  }

  get quiz() {
    return this._quiz;
  }

  get registered(): Date {
    return this._registered;
  }
}
