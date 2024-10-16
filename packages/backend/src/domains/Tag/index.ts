import dayjs from "@/plugins/day";

export default class Tag {
  constructor(
    private _tid: string,
    private _label: string,
    private _color: string | null,
    private _description: string | null,
    private _created: Date,
    private _modified: Date,
    private _creatorUid: string,
  ) {}

  editLabel(label: string) {
    const now = dayjs().toDate();
    
    this._label = label;
    this._modified = now;
  }

  editColor(color: string | null) {
    const now = dayjs().toDate();

    this._color = color;
    this._modified = now;
  }

  editDescription(description: string | null) {
    const now = dayjs().toDate();

    this._description = description;
    this._modified = now;
  }

  get tid(): string {
    return this._tid;
  }

  get label(): string {
    return this._label;
  }

  get color(): string | null {
    return this._color;
  }

  get description(): string | null {
    return this._description;
  }

  get created(): Date {
    return this._created;
  }

  get modified(): Date {
    return this._modified;
  }

  get creatorUid(): string {
    return this._creatorUid;
  }
}
