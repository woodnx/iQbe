import bcrypt from "bcryptjs";

export default class AuthService {
  generateHashedPassword(passwd: string) {
    return bcrypt.hash(passwd, 10);
  }

  checkPassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
