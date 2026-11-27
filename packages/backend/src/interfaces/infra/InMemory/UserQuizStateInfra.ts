import IUserQuizStateRepository from "@/domains/UserQuizState/IUserQuizStateRepository.js";
import UserQuizState from "@/domains/UserQuizState/index.js";

const keyOf = (uid: string, qid: string) => JSON.stringify([uid, qid]);

export class InMemoryUserQuizStateInfra implements IUserQuizStateRepository {
  public DB = new Map<string, UserQuizState>();

  async findByUid(uid: string): Promise<UserQuizState[]> {
    return [...this.DB.values()].filter((state) => state.uid === uid);
  }

  async findByUidAndQid(
    uid: string,
    qid: string,
  ): Promise<UserQuizState | null> {
    return this.DB.get(keyOf(uid, qid)) ?? null;
  }

  async findOrCreateForUpdate(
    uid: string,
    qid: string,
  ): Promise<UserQuizState> {
    const saved = this.DB.get(keyOf(uid, qid));
    if (saved) return saved;
    const unlearned = UserQuizState.create(uid, qid);
    this.DB.set(keyOf(uid, qid), unlearned);
    return unlearned;
  }

  async save(userQuizState: UserQuizState): Promise<UserQuizState> {
    if (!this.DB.has(keyOf(userQuizState.uid, userQuizState.qid))) {
      throw new Error(
        "A review state must be created by findOrCreateForUpdate before saving",
      );
    }
    this.DB.set(keyOf(userQuizState.uid, userQuizState.qid), userQuizState);
    return userQuizState;
  }
}
