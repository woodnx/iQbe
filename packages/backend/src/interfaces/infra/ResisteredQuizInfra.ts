import RegisteredQuiz from "@/domains/RegisteredQuiz";
import IRegisteredQuizRepository from "@/domains/RegisteredQuiz/IResiteredQuizRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";

export default class RegisteredQuizInfra implements IRegisteredQuizRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async insert(registeredQuiz: RegisteredQuiz): Promise<void> {
    const client = this.clientManager.getClient();

    const now = new Date();

    const [quizId, mylistId] = await Promise.all([
      client
        .selectFrom("quizzes")
        .select("id")
        .where("qid", "=", registeredQuiz.quiz.qid)
        .executeTakeFirstOrThrow()
        .then((quiz) => quiz.id),

      client
        .selectFrom("mylists")
        .select("id")
        .where("mid", "=", registeredQuiz.mylist.mid)
        .executeTakeFirstOrThrow()
        .then((mylist) => mylist.id),
    ]);

    client
      .insertInto("mylists_quizzes")
      .values({
        quiz_id: quizId,
        mylist_id: mylistId,
        registered: now,
      })
      .execute();
  }

  async delete(registeredQuiz: RegisteredQuiz): Promise<void> {
    const client = this.clientManager.getClient();

    const now = new Date();

    const [quizId, mylistId] = await Promise.all([
      client
        .selectFrom("quizzes")
        .select("id")
        .where("qid", "=", registeredQuiz.quiz.qid)
        .executeTakeFirstOrThrow()
        .then((quiz) => quiz.id),

      client
        .selectFrom("mylists")
        .select("id")
        .where("mid", "=", registeredQuiz.mylist.mid)
        .executeTakeFirstOrThrow()
        .then((mylist) => mylist.id),
    ]);

    client
      .deleteFrom("mylists_quizzes")
      .where(({ eb, and }) =>
        and([eb("quiz_id", "=", quizId), eb("mylist_id", "=", mylistId)]),
      )
      .execute();
  }
}
