import History from "@/domains/History";
import IHistoryRepository from "@/domains/History/IHistoryRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";

export default class HistoryInfra implements IHistoryRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async add(history: History): Promise<void> {
    const client = this.clientManager.getClient();
    const now = new Date();

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
        practiced: now,
        judgement: history.judgement,
        pressed_word: history.pressedWordPosition,
      })
      .executeTakeFirst();
  }
}
