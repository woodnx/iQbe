import Auth from ".";

export default interface IAuthRepository {
  save(auth: Auth): Promise<void>;
}
