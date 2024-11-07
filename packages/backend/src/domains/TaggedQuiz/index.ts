import Tag from "../Tag";

export default class TaggedQuiz {
  constructor(
    private _qid: string,
    private _tag: Tag,
  ) { }

  get tag() {
    return this._tag;
  }

  get qid() {
    return this._qid;
  }
}
