export default class Category {
  constructor(
    private _id: number,
    private _name: string,
    private _description: string | null,
  ){}
  
  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }
}
