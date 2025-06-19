import AccessToken from "../AccessToken";
import RefreshToken from "../RefreshToken";
import User from "../User";

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
