import UserQuizState from ".";

export default interface IUserQuizStateRepository {
  findByUid(uid: string): Promise<UserQuizState[]>;
  findByUidAndQid(uid: string, qid: string): Promise<UserQuizState | null>;
  save(userQuizState: UserQuizState): Promise<UserQuizState>;
}
