import UserQuizState from "@/domains/UserQuizState";
import IUserQuizStateRepository from "@/domains/UserQuizState/IUserQuizStateRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";

export default class UserQuizStateInfra implements IUserQuizStateRepository {
  constructor(private clientManageer: KyselyClientManager) {}

  async findByUid(uid: string) {
    const client = this.clientManageer.getClient();

    const userQuizState = await client
      .selectFrom("user_quiz_states")
      .innerJoin("users", "user_quiz_states.user_id", "users.id")
      .innerJoin("quizzes", "user_quiz_states.quiz_id", "quizzes.id")
      .select([
        "users.uid",
        "quizzes.qid",
        "state",
        "review_count",
        "success_streak",
        "interval_days",
        "last_reviewed_at",
        "next_review_at",
      ])
      .where("uid", "=", uid)
      .execute();

    return userQuizState.map(
      (v) =>
        new UserQuizState(
          v.uid,
          v.qid,
          v.state,
          v.review_count,
          v.success_streak,
          v.interval_days,
          v.last_reviewed_at,
          v.next_review_at,
        ),
    );
  }

  async findByUidAndQid(uid: string, qid: string) {
    const client = this.clientManageer.getClient();

    const userQuizState = await client
      .selectFrom("user_quiz_states")
      .innerJoin("users", "user_quiz_states.user_id", "users.id")
      .innerJoin("quizzes", "user_quiz_states.quiz_id", "quizzes.id")
      .select([
        "users.uid",
        "quizzes.qid",
        "state",
        "review_count",
        "success_streak",
        "interval_days",
        "last_reviewed_at",
        "next_review_at",
      ])
      .where("uid", "=", uid)
      .where("qid", "=", qid)
      .executeTakeFirst();

    if (!userQuizState) return null;

    return new UserQuizState(
      userQuizState.uid,
      userQuizState.qid,
      userQuizState.state,
      userQuizState.review_count,
      userQuizState.success_streak,
      userQuizState.interval_days,
      userQuizState.last_reviewed_at,
      userQuizState.next_review_at,
    );
  }

  async save(userQuizState: UserQuizState) {
    const client = this.clientManageer.getClient();

    const exist = await this.findByUidAndQid(
      userQuizState.uid,
      userQuizState.qid,
    );

    const [userId, quizId] = await Promise.all([
      client
        .selectFrom("users")
        .select("id")
        .where("uid", "=", userQuizState.uid)
        .executeTakeFirstOrThrow()
        .then((u) => u.id),
      client
        .selectFrom("quizzes")
        .select("id")
        .where("qid", "=", userQuizState.qid)
        .executeTakeFirstOrThrow()
        .then((q) => q.id),
    ]);

    if (!exist) {
      await client
        .insertInto("user_quiz_states")
        .values({
          user_id: userId,
          quiz_id: quizId,
          state: userQuizState.state,
          review_count: userQuizState.reviewCount,
          success_streak: userQuizState.successStreak,
          interval_days: userQuizState.intervalDays,
          last_reviewed_at: userQuizState.lastReviewedAt,
          next_review_at: userQuizState.nextReviewAt,
          updated_at: new Date(),
        })
        .executeTakeFirst();
    } else {
      await client
        .updateTable("user_quiz_states")
        .set({
          state: userQuizState.state,
          review_count: userQuizState.reviewCount,
          success_streak: userQuizState.successStreak,
          interval_days: userQuizState.intervalDays,
          last_reviewed_at: userQuizState.lastReviewedAt,
          next_review_at: userQuizState.nextReviewAt,
          updated_at: new Date(),
        })
        .where("user_id", "=", userId)
        .where("quiz_id", "=", quizId)
        .executeTakeFirst();
    }

    return userQuizState;
  }
}
