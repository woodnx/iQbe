import RefreshToken from "./index.js";

export default interface IRefreshTokensRepository {
  findByUid(uid: string): Promise<RefreshToken | null>;
  revokeToken(uid: string, token: string): Promise<void>;
  revokeByUid(uid: string): Promise<void>;
  save(refreshToken: RefreshToken): Promise<void>;
}
