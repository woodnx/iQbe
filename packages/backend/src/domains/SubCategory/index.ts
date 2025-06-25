export default class SubCategory {
  constructor(
    private _id: number | null,
    private _name: string,
    private _description: string | null,
    private _parentId: number,
  ) {}

  static create(name: string, description: string | null, parentId: number) {
    return new SubCategory(null, name, description, parentId);
  }

  get id(): number {
    if (!this._id) throw new Error("SubCategory id is not defined");
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get parentId(): number {
    return this._parentId;
  }
}
