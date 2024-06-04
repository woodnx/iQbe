export default class RefreshToken {
  constructor(
    private _token: string,
    private _uid: string,
  ) {}
  
  get token(): string {
    return this._token;
  }

  get uid(): string {
    return this._uid;
  }
}
