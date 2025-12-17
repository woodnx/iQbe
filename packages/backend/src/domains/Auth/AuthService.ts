import bcrypt from "bcrypt";

export default class AuthService {
  generateHashedPassword(passwd: string) {
    return bcrypt.hashSync(passwd, 10);
  }

  checkPassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }
}
