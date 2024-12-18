export default class InviteCode {
  private constructor(
    private _code: string,
    private _used: 0 | 1,
    private _created: Date,
    private _updated: Date,
  ) {}

  static create(code: string) {
    return new InviteCode(code, 0, new Date(), new Date());
  }

  static reconstruct(code: string, used: 0 | 1, created: Date, updated: Date) {
    return new InviteCode(code, used, created, updated);
  }

  public markUsed(): void {
    this._used = 1;
  }

  get code(): string {
    return this._code;
  }

  get used(): number {
    return this._used;
  }

  get created(): Date {
    return this._created; 
  }
}
