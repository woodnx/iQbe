export default class Workbook {
  constructor(
    private _wid: string,
    private _name: string,
    private _date: Date | null,
    private _creatorUid: string,
    private _levelId: number | null,
    private _color: string | null,
  ) {}

  rename(name: string) {
    this._name = name;
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
}
