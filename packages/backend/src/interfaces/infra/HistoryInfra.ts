import IHistoryRepository from "@/domains/History/IHistoryRepository.js";
import History from "@/domains/History/index.js";
import KyselyClientManager from "./kysely/KyselyClientManager.js";

export default class HistoryInfra implements IHistoryRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async getAllDates(uid: string): Promise<Date[]> {
    const client = this.clientManager.getClient();

    const histories = await client
      .selectFrom("histories")
      .innerJoin("users", "histories.user_id", "users.id")
      .select(["histories.practiced"])
      .groupBy("histories.practiced")
      .orderBy("histories.practiced", "desc")
      .where("users.uid", "=", uid)
      .execute()
      .then((result) => result.map((r) => r.practiced));

    return histories;
  }

  private async findByClientAttemptId(
    uid: string,
    clientAttemptId: string,
  ): Promise<History | null> {
    const client = this.clientManager.getClient();

    const history = await client
      .selectFrom("histories")
      .innerJoin("users", "histories.user_id", "users.id")
      .innerJoin("quizzes", "histories.quiz_id", "quizzes.id")
      .select([
        "client_attempt_id",
        "quizzes.qid",
        "users.uid",
        "histories.judgement",
        "histories.pressed_word",
        "histories.practiced",
      ])
      .where("client_attempt_id", "=", clientAttemptId)
      .where("users.uid", "=", uid)
      .executeTakeFirst();

    if (!history) return null;

    return new History(
      history.qid,
      history.uid,
      history.pressed_word,
      history.judgement,
      history.practiced,
      history.client_attempt_id,
    );
  }

  async add(history: History): Promise<History> {
    const client = this.clientManager.getClient();

    const [userId, quizId] = await Promise.all([
      client
        .selectFrom("users")
        .select("id")
        .where("uid", "=", history.uid)
        .executeTakeFirstOrThrow()
        .then((user) => user.id),

      client
        .selectFrom("quizzes")
        .select("id")
        .where("qid", "=", history.qid)
        .executeTakeFirstOrThrow()
        .then((quiz) => quiz.id),
    ]);

    try {
      await client
        .insertInto("histories")
        .values({
          user_id: userId,
          quiz_id: quizId,
          practiced: history.practicedAt,
          judgement: history.judgement,
          pressed_word: history.pressedWordPosition,
          client_attempt_id: history.clientAttemptId,
        })
        .executeTakeFirst();
      return history;
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !("code" in error) ||
        error.code !== "ER_DUP_ENTRY" ||
        history.clientAttemptId === null
      ) {
        throw error;
      }

      const existing = await this.findByClientAttemptId(
        history.uid,
        history.clientAttemptId,
      );
      if (!existing) throw error;
      return existing;
    }
  }
}
