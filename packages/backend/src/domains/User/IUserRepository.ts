import User from ".";

export default interface IUserRepository {
  findByUid(uid: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findUserIdByEmail(email: string): Promise<number | null>;
  findLastUserId(): Promise<number | null>;
  existAnyUsers(): Promise<boolean>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
}
