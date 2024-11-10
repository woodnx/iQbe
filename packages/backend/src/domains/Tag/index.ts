export default class Tag {
  private _created: Date;
  
  constructor(
    private _label: string,
  ) {
    this._created = new Date();
  }

  get label(): string {
    return this._label;
  }

  get created(): Date {
    return this._created;
  }
}
