export default class Category {
  constructor(
    private _id: number | null,
    private _name: string,
    private _description: string | null,
    private _parentId: number,
    private _disabled: boolean = false,
  ) {}

  static create(
    name: string,
    description: string | null,
    parentId: number,
    disabled: boolean,
  ) {
    return new Category(null, name, description, parentId, disabled);
  }

  disable() {
    this._disabled = true;
  }

  editDescription(description: string | null) {
    this._description = description;
  }

  get id(): number {
    if (!this._id) throw new Error("Category id is not defined");

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

  get disabled(): boolean {
    return this._disabled;
  }
}
