import RefreshToken from ".";

export default interface IRefreshTokensRepository {
  findByUid(uid: string): Promise<RefreshToken | null>;
  save(refreshToken: RefreshToken): Promise<void>;
}
