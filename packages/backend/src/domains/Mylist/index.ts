export default class Mylist {
  constructor(
    private _mid: string,
    private _creatorUid: string,
    private _name: string,
    private _created: Date,
  ) {}

  reconstruct(
    _mid: string,
    _creator_uid: string,
    _name: string,
    _created: Date,
    _quizzes: number[],
  ): Mylist {
    return new Mylist(_mid, _creator_uid, _name, _created);
  }

  rename(name: string) {
    this._name = name;
  }

  get mid(): string {
    return this._mid;
  }

  get creatorUid(): string {
    return this._creatorUid;
  }

  get name(): string {
    return this._name;
  }

  get created(): Date {
    return this._created;
  }
}
