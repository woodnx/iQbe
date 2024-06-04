export default class SubCategory {
  constructor(
    private _id: number,
    private _name: string,
    private _description: string | null,
    private _parentId: number,
  ) {}
  
  get id(): number {
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
