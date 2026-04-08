import Mylist from "@/domains/Mylist";
import IMylistRepository from "@/domains/Mylist/IMylistRepository";
import dayjs from "@/plugins/day";
import KyselyClientManager from "./kysely/KyselyClientManager";

export default class MylistInfra implements IMylistRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async findByMid(mid: string, uid: string): Promise<Mylist | null> {
    const client = this.clientManager.getClient();

    // マイリストとユーザー情報をまとめて取得
    const mylist = await client
      .selectFrom("mylists")
      .innerJoin("users", "mylists.user_id", "users.id")
      .select([
        "mylists.id as id",
        "mylists.mid",
        "users.id as userId",
        "users.uid as creatorUid",
        "mylists.name",
        "mylists.created as created",
      ])
      .where("users.uid", "=", uid)
      .where("mylists.mid", "=", mid)
      .executeTakeFirst();

    if (!mylist) return null;

    const userId = mylist.userId;
    const mylistId = mylist.id;

    // 2. 取得したマイリスト群に紐づくquizIDを一括取得
    const registeredQuizzes = await client
      .selectFrom("mylists_quizzes")
      .select(["mylist_id", "quiz_id"])
      .where("mylist_id", "=", mylistId)
      .execute();
    const quizIds = [...new Set(registeredQuizzes.map((q) => q.quiz_id))];

    const histories =
      quizIds.length > 0
        ? await client
            .selectFrom("histories")
            .select(["quiz_id", "judgement", "practiced"])
            .where("user_id", "=", userId)
            .where("quiz_id", "in", quizIds)
            .execute()
        : [];

    const total = histories.length;
    const corrects = histories.filter((h) => h.judgement == 1).length;
    const wrongs = histories.filter((h) => h.judgement == 0).length;
    const ignored = histories.filter((h) => h.judgement == 2).length;
    const lastPracticed =
      histories.length === 0
        ? null
        : histories.reduce((last, history) => {
            const practiced = dayjs(history.practiced);
            if (last.isBefore(practiced)) last = practiced;
            return last;
          }, dayjs("1000-01-01"));

    return new Mylist(
      mylist.mid,
      mylist.creatorUid,
      mylist.name,
      mylist.created,
      total,
      corrects,
      wrongs,
      ignored,
      lastPracticed ? lastPracticed.toDate() : null,
    );
  }

  async findManyByCreatorUid(uid: string): Promise<Mylist[]> {
    const client = this.clientManager.getClient();

    // マイリストとユーザー情報をまとめて取得
    const mylists = await client
      .selectFrom("mylists")
      .innerJoin("users", "mylists.user_id", "users.id")
      .select([
        "mylists.id as id",
        "mylists.mid",
        "users.id as userId",
        "users.uid as creatorUid",
        "mylists.name",
        "mylists.created as created",
      ])
      .where("users.uid", "=", uid)
      .execute();

    if (mylists.length === 0) return [];

    const userId = mylists[0].userId;
    const mylistIds = mylists.map((m) => m.id);

    // 2. 取得したマイリスト群に紐づく「クイズID」を「1回のクエリ」で一括取得
    const registeredQuizzes = await client
      .selectFrom("mylists_quizzes")
      .select(["mylist_id", "quiz_id"])
      .where("mylist_id", "in", mylistIds)
      .execute();

    const quizIds = [...new Set(registeredQuizzes.map((q) => q.quiz_id))];

    // 対象となる全クイズの履歴を一括取得
    const histories =
      quizIds.length > 0
        ? await client
            .selectFrom("histories")
            .select(["quiz_id", "judgement", "practiced"])
            .where("user_id", "=", userId)
            .where("quiz_id", "in", quizIds)
            .execute()
        : [];

    return mylists.map((mylist) => {
      // このマイリストに属するクイズのIDリスト
      const targetQuizIds = registeredQuizzes
        .filter((rq) => rq.mylist_id === mylist.id)
        .map((rq) => rq.quiz_id);

      // このマイリストに属するクイズの履歴リスト
      const targetHistories = histories.filter((h) =>
        targetQuizIds.includes(h.quiz_id),
      );

      const total = targetQuizIds.length;
      const corrects = targetHistories.filter((h) => h.judgement == 1).length;
      const wrongs = targetHistories.filter((h) => h.judgement == 0).length;
      const ignored = targetHistories.filter((h) => h.judgement == 2).length;
      const lastPracticed =
        histories.length === 0
          ? null
          : histories.reduce((last, history) => {
              const practiced = dayjs(history.practiced);
              if (last.isBefore(practiced)) last = practiced;
              return last;
            }, dayjs("1000-01-01"));

      return new Mylist(
        mylist.mid,
        mylist.creatorUid,
        mylist.name,
        mylist.created,
        total,
        corrects,
        wrongs,
        ignored,
        lastPracticed ? lastPracticed.toDate() : null,
      );
    });
  }

  async save(mylist: Mylist): Promise<void> {
    const client = this.clientManager.getClient();

    const userId = await client
      .selectFrom("users")
      .select("id")
      .where("uid", "=", mylist.creatorUid)
      .executeTakeFirstOrThrow()
      .then((u) => u.id);

    await client
      .insertInto("mylists")
      .values({
        mid: mylist.mid,
        name: mylist.name,
        user_id: userId,
        created: mylist.created,
        attr: 100,
      })
      .execute();
  }

  async update(mylist: Mylist): Promise<void> {
    const client = this.clientManager.getClient();

    const userId = await client
      .selectFrom("users")
      .select("id")
      .where("uid", "=", mylist.creatorUid)
      .executeTakeFirstOrThrow()
      .then((u) => u.id);

    await client
      .updateTable("mylists")
      .set({
        mid: mylist.mid,
        name: mylist.name,
        user_id: userId,
        created: mylist.created,
        attr: 100,
      })
      .where("mid", "=", mylist.mid)
      .execute();
  }

  async delete(mylist: Mylist): Promise<void> {
    const client = this.clientManager.getClient();

    await client.deleteFrom("mylists").where("mid", "=", mylist.mid).execute();
  }
}
