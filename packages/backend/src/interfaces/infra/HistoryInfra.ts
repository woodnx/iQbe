import History from "@/domains/History";
import IHistoryRepository from "@/domains/History/IHistoryRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";

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

  async add(history: History): Promise<void> {
    const client = this.clientManager.getClient();

    const [userId, quizId] = await Promise.all([
      client
        .selectFrom("users")
        .select("id")
        .where("uid", "=", history.user.uid)
        .executeTakeFirstOrThrow()
        .then((user) => user.id),

      client
        .selectFrom("quizzes")
        .select("id")
        .where("qid", "=", history.quiz.qid)
        .executeTakeFirstOrThrow()
        .then((quiz) => quiz.id),
    ]);

    await client
      .insertInto("histories")
      .values({
        user_id: userId,
        quiz_id: quizId,
        practiced: history.practicedAt,
        judgement: history.judgement,
        pressed_word: history.pressedWordPosition,
      })
      .executeTakeFirst();
  }
}
