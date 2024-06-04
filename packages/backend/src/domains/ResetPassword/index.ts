export default class ResetPassword {
  constructor(
    private _token: string,
    private _exp: Date,
    private _used: boolean,
    private _requestedUid: string,
  ) {}

  use() {
    this._used = true;
  }

  get token(): string {
    return this._token;
  }

  get exp(): Date {
    return this._exp;
  }

  get used(): boolean {
    return this._used;
  }

  get requestedUid(): string {
    return this._requestedUid;
  }
}
