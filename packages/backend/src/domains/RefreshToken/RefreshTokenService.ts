import { randomUUID } from "crypto";

export default class RefreshTokenService {
  generateToken() {
    return randomUUID();
  }
}
