export default class InviteCode {
  private _code: string;
  private _used: number;

  constructor(_code: string);
  constructor(_code: string, _used: number);

  constructor(_code: string, _used?: number) {
    this._code = _code;
    this._used = _used || 0;
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
}
