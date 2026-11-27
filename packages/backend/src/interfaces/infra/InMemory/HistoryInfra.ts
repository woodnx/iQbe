import DuplicateClientAttemptError from "@/domains/History/DuplicateClientAttemptError.js";
import IHistoryRepository from "@/domains/History/IHistoryRepository.js";
import type {
  AnsweredPair,
  StudyDayAssignment,
} from "@/domains/History/IHistoryRepository.js";
import History from "@/domains/History/index.js";

export class InMemoryHistoryInfra implements IHistoryRepository {
  public DB: History[] = [];
  public nextId = 1n;

  async getAllDates(uid: string): Promise<Date[]> {
    return this.DB.filter((history) => history.uid === uid).map(
      (history) => history.practicedAt,
    );
  }

  async add(history: History): Promise<bigint> {
    const isDuplicate =
      history.clientAttemptId !== null &&
      this.DB.some(
        (saved) =>
          saved.uid === history.uid &&
          saved.clientAttemptId === history.clientAttemptId,
      );
    if (isDuplicate) {
      throw new DuplicateClientAttemptError(new Error("duplicate key"));
    }
    const id = this.nextId;
    this.nextId += 1n;
    this.DB.push(copyWithId(history, id, history.studyDayPlacement));
    return id;
  }

  async findByClientAttemptId(
    uid: string,
    clientAttemptId: string,
  ): Promise<History | null> {
    return (
      this.DB.find(
        (history) =>
          history.uid === uid && history.clientAttemptId === clientAttemptId,
      ) ?? null
    );
  }

  async listByUidAndQid(uid: string, qid: string): Promise<History[]> {
    return this.DB.filter(
      (history) => history.uid === uid && history.qid === qid,
    ).sort(
      (a, b) =>
        a.practicedAt.getTime() - b.practicedAt.getTime() ||
        Number((a.id ?? 0n) - (b.id ?? 0n)),
    );
  }

  async assignStudyDayPlacements(
    assignments: readonly StudyDayAssignment[],
  ): Promise<void> {
    for (const { historyId, studyDate, dailyAttemptNumber } of assignments) {
      const index = this.DB.findIndex((history) => history.id === historyId);
      if (index < 0 || this.DB[index].studyDayPlacement !== null) continue;
      this.DB[index] = copyWithId(this.DB[index], historyId, {
        studyDate,
        dailyAttemptNumber,
      });
    }
  }

  async listAnsweredPairs(
    after: AnsweredPair | null,
    limit: number,
  ): Promise<AnsweredPair[]> {
    const keys = new Set(
      this.DB.map((history) => JSON.stringify([history.uid, history.qid])),
    );
    return [...keys]
      .map((key) => {
        const [uid, qid] = JSON.parse(key) as [string, string];
        return { uid, qid };
      })
      .sort((a, b) => compareText(a.uid, b.uid) || compareText(a.qid, b.qid))
      .filter(
        (pair) =>
          after === null ||
          pair.uid > after.uid ||
          (pair.uid === after.uid && pair.qid > after.qid),
      )
      .slice(0, limit);
  }
}

const compareText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

function copyWithId(
  history: History,
  id: bigint,
  studyDayPlacement: History["studyDayPlacement"],
) {
  return new History(
    history.qid,
    history.uid,
    history.pressedWordPosition,
    history.judgement,
    history.practicedAt,
    history.clientAttemptId,
    id,
    history.mode,
    studyDayPlacement,
    history.reviewOutcome,
  );
}
