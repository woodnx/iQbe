import dayjs from "@/plugins/day.js";
import UserQuizState from "@/domains/UserQuizState";
import {
  deserializeFsrsMemory,
  serializeFsrsMemory,
} from "./fsrs/FsrsMemoryCodec.js";
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
        "fsrs_memory",
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
          deserializeFsrsMemory(v.fsrs_memory),
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
        "fsrs_memory",
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
      deserializeFsrsMemory(userQuizState.fsrs_memory),
    );
  }

  async findOrCreateForUpdate(uid: string, qid: string) {
    const client = this.clientManageer.getClient();
    if (!client.isTransaction) {
      throw new Error("Locking a review state requires a transaction");
    }
    const { userId, quizId } = await this.resolveIds(uid, qid);
    const unlearned = UserQuizState.create(uid, qid);

    // 先に SELECT ... FOR UPDATE しないのは、行が無いとギャップロックになり、
    // 同時に来た初回解答どうしがデッドロックするため。先に行を必ず存在させる
    // （https://dev.mysql.com/doc/refman/9.1/en/innodb-locks-set.html ）。
    await client
      .insertInto("user_quiz_states")
      .values({
        user_id: userId,
        quiz_id: quizId,
        state: unlearned.state,
        review_count: unlearned.reviewCount,
        success_streak: unlearned.successStreak,
        interval_days: unlearned.intervalDays,
        last_reviewed_at: null,
        next_review_at: null,
        fsrs_memory: null,
        updated_at: dayjs().toDate(),
      })
      .onDuplicateKeyUpdate({ user_id: userId })
      .execute();

    const locked = await client
      .selectFrom("user_quiz_states")
      .select([
        "state",
        "review_count",
        "success_streak",
        "interval_days",
        "last_reviewed_at",
        "next_review_at",
        "fsrs_memory",
      ])
      .where("user_id", "=", userId)
      .where("quiz_id", "=", quizId)
      .forUpdate()
      .executeTakeFirstOrThrow();

    return new UserQuizState(
      uid,
      qid,
      locked.state,
      locked.review_count,
      locked.success_streak,
      locked.interval_days,
      locked.last_reviewed_at,
      locked.next_review_at,
      deserializeFsrsMemory(locked.fsrs_memory),
    );
  }

  async save(userQuizState: UserQuizState) {
    const client = this.clientManageer.getClient();
    // 時刻は ReviewService が秒へ切り捨て済みなので、ここでは加工しない（履歴と同じ値にする）。
    // user_id・quiz_id を別の検索で求めず、同じ文で uid・qid から引く。
    const result = await client
      .updateTable("user_quiz_states")
      .set({
        state: userQuizState.state,
        review_count: userQuizState.reviewCount,
        success_streak: userQuizState.successStreak,
        interval_days: userQuizState.intervalDays,
        last_reviewed_at: userQuizState.lastReviewedAt,
        next_review_at: userQuizState.nextReviewAt,
        fsrs_memory: serializeFsrsMemory(userQuizState.memory),
        updated_at: dayjs().toDate(),
      })
      .where("user_id", "=", (eb) =>
        eb
          .selectFrom("users")
          .select("id")
          .where("uid", "=", userQuizState.uid),
      )
      .where("quiz_id", "=", (eb) =>
        eb
          .selectFrom("quizzes")
          .select("id")
          .where("qid", "=", userQuizState.qid),
      )
      .executeTakeFirstOrThrow();
    // mysql2 は既定で一致した行数を返す（値が変わらなくても 1）。
    if (result.numUpdatedRows !== 1n) {
      throw new Error(
        "A review state must be created by findOrCreateForUpdate before saving",
      );
    }

    return userQuizState;
  }

  private async resolveIds(uid: string, qid: string) {
    const client = this.clientManageer.getClient();
    const [userId, quizId] = await Promise.all([
      client
        .selectFrom("users")
        .select("id")
        .where("uid", "=", uid)
        .executeTakeFirstOrThrow()
        .then((u) => u.id),
      client
        .selectFrom("quizzes")
        .select("id")
        .where("qid", "=", qid)
        .executeTakeFirstOrThrow()
        .then((q) => q.id),
    ]);
    return { userId, quizId };
  }
}
