export default class Workbook {
  constructor(
    private _wid: string,
    private _name: string,
    private _date: Date | null,
    private _creatorUid: string,
    private _levelId: number | null,
    private _color: string | null,
    private _total: number,
    private _corrects: number,
    private _wrongs: number,
    private _ignored: number,
    private _lastPracticedAt: Date | null,
  ) {}

  rename(name: string) {
    this._name = name;
  }

  setDate(date: Date | null) {
    this._date = date;
  }

  get wid(): string {
    return this._wid;
  }

  get name(): string {
    return this._name;
  }

  get date(): Date | null {
    return this._date;
  }

  get creatorUid(): string {
    return this._creatorUid;
  }

  get levelId(): number | null {
    return this._levelId;
  }

  get color(): string | null {
    return this._color;
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
