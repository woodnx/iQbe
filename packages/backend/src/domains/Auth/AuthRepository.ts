import Auth from "./index.js";

export default interface IAuthRepository {
  save(auth: Auth): Promise<void>;
}
