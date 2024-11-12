export default class Category {

  constructor(
    private _id: number | null,
    private _name: string,
    private _description: string | null,
  ){}

  static create(
    name: string,
    description: string | null,
  ) {
    return new Category(null, name, description);
  }
  
  get id(): number {
    if (!this._id) 
      throw new Error('Category id is not defined');

    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }
}
