export default class User {
  constructor(
    private _uid: string,
    private _passwd: string,
    private _username: string,
    private _email: string,
    private _created: Date,
    private _modified: Date,
    private _nickname?: string,
    private _permission?: string,
  ) {}

  reconstruct(
    uid: string,
    passwd: string,
    username: string,
    email: string,
    created: Date,
    modified: Date,
    nickname?: string,
    permission?: string,
  ): void {
    this._uid = uid;
    this._passwd = passwd;
    this._username = username;
    this._email = email;
    this._created = created;
    this._modified = modified;
    this._nickname = nickname;
    this._permission = permission;
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

  get nickname(): string | undefined {
    return this._nickname;
  }

  get permission(): string | undefined {
    return this._permission;
  }

  get created(): Date {
    return this._created;
  }

  get modified(): Date {
    return this._modified;
  }

}
