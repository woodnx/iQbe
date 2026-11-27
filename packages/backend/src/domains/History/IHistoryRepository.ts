import History from "./index.js";

export type AnsweredPair = Readonly<{ uid: string; qid: string }>;

export type StudyDayAssignment = Readonly<{
  historyId: bigint;
  studyDate: string;
  dailyAttemptNumber: number;
}>;

export default interface IHistoryRepository {
  getAllDates(uid: string): Promise<Date[]>;
  /** 保存した履歴の id を返す。clientAttemptId が保存済みなら DuplicateClientAttemptError を投げる。 */
  add(history: History): Promise<bigint>;
  findByClientAttemptId(
    uid: string,
    clientAttemptId: string,
  ): Promise<History | null>;
  /** 古い順（practiced、id の昇順）。 */
  listByUidAndQid(uid: string, qid: string): Promise<History[]>;
  /** 移行用。学習日がまだ入っていない行だけを更新する。 */
  assignStudyDayPlacements(
    assignments: readonly StudyDayAssignment[],
  ): Promise<void>;
  /** 移行用。解答履歴があるユーザー・問題の組を uid、qid の昇順で返す。after の次から limit 件。 */
  listAnsweredPairs(
    after: AnsweredPair | null,
    limit: number,
  ): Promise<AnsweredPair[]>;
}
