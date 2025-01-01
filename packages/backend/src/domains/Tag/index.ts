export default class Tag {  
  private constructor(
    private readonly _id: number | null,
    private readonly _label: string,
    private readonly _created: Date,
    private _usageCount: number,
  ) {}

  static create(
    label: string,
  ) {
    return new Tag(
      null, label, new Date(), 0,
    );
  }

  static reconstruct(
    id: number,
    label: string,
    created: Date,
    usageCount: number,
  ) {
    return new Tag(id, label, created, usageCount);
  }

  incrementTagUsage() {
    this._usageCount++;
  }

  decrementTagUsage() {
    if (this._usageCount > 0) {
      this._usageCount--;
    }
  }

  get id(): number {
    if (this._id == null) 
      throw new Error('id is not defined');

    return this._id;
  }

  get label(): string {
    return this._label;
  }

  get usageCount(): number {
    return this._usageCount;
  }

  get created(): Date {
    return this._created;
  }
}
