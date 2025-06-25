import IUsersRepository from "./IUserRepository";
import { uid } from "uid/secure";

export default class UserService {
  constructor(private usersRepository: IUsersRepository) {}

  generateUid(): string {
    return uid(28);
  }

  async checkFirstStart(): Promise<boolean> {
    return !(await this.usersRepository.existAnyUsers());
  }
}
