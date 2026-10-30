export default class Mylist {
  constructor(
    private _mid: string,
    private _creatorUid: string,
    private _name: string,
    private _created: Date,
    private _total: number,
    private _corrects: number,
    private _wrongs: number,
    private _ignored: number,
    private _lastPracticedAt: Date | null,
  ) {}

  reconstruct(
    _mid: string,
    _creator_uid: string,
    _name: string,
    _created: Date,
    _quizzes: number[],
    _total: number,
    _corrects: number,
    _wrongs: number,
    _ignored: number,
    _lastPracticedAt: Date | null,
  ): Mylist {
    return new Mylist(
      _mid,
      _creator_uid,
      _name,
      _created,
      _total,
      _corrects,
      _wrongs,
      _ignored,
      _lastPracticedAt,
    );
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

  get total(): number {
    return this._total;
  }

  get corrects(): number {
    return this._corrects;
  }

  get wrongs(): number {
    return this._wrongs;
  }

  get ignored(): number {
    return this._ignored;
  }

  get lastPracticedAt(): Date | null {
    return this._lastPracticedAt;
  }
}
