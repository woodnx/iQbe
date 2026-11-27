import UserQuizState from ".";

export default interface IUserQuizStateRepository {
  findByUid(uid: string): Promise<UserQuizState[]>;
  findByUidAndQid(uid: string, qid: string): Promise<UserQuizState | null>;
  /**
   * 行が無ければ未学習の状態で作り、排他ロックして返す。トランザクション内でだけ呼べる。
   * 同じユーザー・問題への解答は、このロックを取った順に処理される。
   */
  findOrCreateForUpdate(uid: string, qid: string): Promise<UserQuizState>;
  /**
   * findOrCreateForUpdate でロックした行を、同じトランザクションの中で上書きする。
   * ロックや同時更新の確認はしないので、ロックせずに呼ぶと他の解答の更新を失い得る。
   * 行が無ければ例外を投げる。
   */
  save(userQuizState: UserQuizState): Promise<UserQuizState>;
}
