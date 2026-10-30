import { db } from "@/database.js";
import QuizService from "@/domains/Quiz/QuizService.js";

const quizService = new QuizService();

(async () => {
  const quizzes = await db.selectFrom("quizzes").select("id").execute();

  for (const quiz of quizzes) {
    const qid = quizService.generateQid();

    await db
      .updateTable("quizzes")
      .set({
        qid,
      })
      .where("id", "=", quiz.id)
      .execute();

    console.log("#", quiz.id, " inserted ", qid);
  }
})();
