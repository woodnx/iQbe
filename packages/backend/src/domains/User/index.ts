export default class User {
  constructor(
    private _uid: string,
    private _passwd: string,
    private _username: string,
    private _email: string,
    private _nickname: string | null,
    private _created: Date,
    private _modified: Date,
  ) {}

  reconstruct(
    uid: string,
    passwd: string,
    username: string,
    email: string,
    nickname: string | null,
    created: Date,
    modified: Date,
  ): User {
    return new User(
      uid,
      passwd,
      username,
      email,
      nickname,
      created,
      modified,
    );
  }

  resetPasswd(passwd: string) {
    this._passwd = passwd;
  }
  
  get passwd(): string {
    return this._passwd;
  }

  get uid(): string {
    return this._uid;
  }

  get username(): string {
    return this._username
  }

  get email(): string {
    return this._email;
  }

  get nickname(): string | null {
    return this._nickname;
  }

  get created(): Date {
    return this._created;
  }

  get modified(): Date {
    return this._modified;
  }

}
