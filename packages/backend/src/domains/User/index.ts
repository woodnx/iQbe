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
    private _photoUrl?: string
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
    photoUrl?: string
  ): void {
    this._uid = uid;
    this._passwd = passwd;
    this._username = username;
    this._email = email;
    this._created = created;
    this._modified = modified;
    this._nickname = nickname;
    this._permission = permission;
    this._photoUrl = photoUrl;
  }

  editUsername(username: string) {
    this._username = username;
  }

  editNickname(nickname?: string) {
    this._nickname = nickname;
  }

  resetPasswd(passwd: string) {
    this._passwd = passwd;
  }

  setPhotoUrl(photoUrl: string | undefined) {
    this._photoUrl = photoUrl;
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

  get photoUrl(): string | undefined {
    return this._photoUrl;
  }

  get created(): Date {
    return this._created;
  }

  get modified(): Date {
    return this._modified;
  }

}
