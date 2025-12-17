import ResetPassword from ".";

export default interface IResetPasswordRepository {
  findByToken(token: string): Promise<ResetPassword | null>;
  request(token: string, email: string): Promise<void>;
  save(resetPassword: ResetPassword): Promise<void>;
  update(resetPassword: ResetPassword): Promise<void>;
}
