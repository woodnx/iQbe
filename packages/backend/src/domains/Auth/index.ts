import AccessToken from "../AccessToken/index.js";
import RefreshToken from "../RefreshToken/index.js";
import User from "../User/index.js";

export default class Auth {
  constructor(
    private readonly _user: User,
    private readonly _refreshToken: RefreshToken,
    private readonly _accessToken: AccessToken,
  ) {}

  get user(): User {
    return this._user;
  }

  get refreshToken(): RefreshToken {
    return this._refreshToken;
  }

  get accessToken(): AccessToken {
    return this._accessToken;
  }
}
