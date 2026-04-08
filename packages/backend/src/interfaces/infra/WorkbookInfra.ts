import { ApiError } from "api";
import Workbook from "@/domains/Workbook";
import IWorkbookRepository from "@/domains/Workbook/IWorkbookRepository";
import dayjs, { format } from "@/plugins/day";
import KyselyClientManager from "./kysely/KyselyClientManager";

export default class WorkbookInfra implements IWorkbookRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async findByWid(wid: string, uid: string): Promise<Workbook | null> {
    const client = this.clientManager.getClient();

    const workbook = await client
      .selectFrom("workbooks")
      .leftJoin("levels", "workbooks.level_id", "levels.id")
      .innerJoin("users", "creator_id", "users.id")
      .select([
        "workbooks.id as id",
        "workbooks.name as name",
        "wid",
        "workbooks.date",
        "users.id as userId",
        "users.uid as creatorUId",
        "levels.color as color",
        "level_id as levelId",
      ])
      .where("workbooks.wid", "=", wid)
      .where("users.uid", "=", uid)
      .executeTakeFirst();

    if (!workbook) return null;
    const userId = workbook.userId;

    const quizzes = await client
      .selectFrom("quizzes")
      .select(["id"])
      .where("workbook_id", "=", workbook.id)
      .execute();
    const quizIds = [...new Set(quizzes.map((q) => q.id))];

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

    return new Workbook(
      workbook.wid,
      workbook.name,
      workbook.date,
      workbook.creatorUId,
      workbook.levelId,
      workbook.color,
      total,
      corrects,
      wrongs,
      ignored,
      lastPracticed ? lastPracticed.toDate() : null,
    );
  }

  async findManyByUid(uid: string): Promise<Workbook[]> {
    const client = this.clientManager.getClient();

    const workbooks = await client
      .selectFrom("workbooks")
      .leftJoin("levels", "workbooks.level_id", "levels.id")
      .innerJoin("users", "creator_id", "users.id")
      .select([
        "workbooks.id as id",
        "workbooks.name as name",
        "wid",
        "workbooks.date",
        "users.id as userId",
        "users.uid as creatorUId",
        "levels.color as color",
        "level_id as levelId",
      ])
      .where("uid", "=", uid)
      .execute();

    if (workbooks.length === 0) return [];

    const userId = workbooks[0].userId;
    const workbooksIds = workbooks.map((m) => m.id);

    const quizzes = await client
      .selectFrom("quizzes")
      .select(["id", "workbook_id"])
      .where("workbook_id", "in", workbooksIds)
      .execute();
    const quizIds = [...new Set(quizzes.map((q) => q.id))];

    const histories =
      quizIds.length > 0
        ? await client
            .selectFrom("histories")
            .select(["quiz_id", "judgement", "practiced"])
            .where("user_id", "=", userId)
            .where("quiz_id", "in", quizIds)
            .execute()
        : [];

    return workbooks.map((workbook) => {
      const targetQuizIds = quizzes
        .filter((quiz) => quiz.workbook_id === workbook.id)
        .map((quiz) => quiz.id);

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

      return new Workbook(
        workbook.wid,
        workbook.name,
        workbook.date,
        workbook.creatorUId,
        workbook.levelId,
        workbook.color,
        total,
        corrects,
        wrongs,
        ignored,
        lastPracticed ? lastPracticed.toDate() : null,
      );
    });
  }

  async save(workbook: Workbook): Promise<void> {
    const client = this.clientManager.getClient();

    const userId = await client
      .selectFrom("users")
      .select("id")
      .where("uid", "=", workbook.creatorUid)
      .executeTakeFirst()
      .then((u) => u?.id);

    if (!userId) throw new ApiError().noUser();

    await client
      .insertInto("workbooks")
      .values({
        wid: workbook.wid,
        name: workbook.name,
        date: workbook.date && format(workbook.date),
        creator_id: userId,
        level_id: workbook.levelId,
      })
      .execute();
  }

  async update(workbook: Workbook): Promise<void> {
    const client = this.clientManager.getClient();

    await client
      .updateTable("workbooks")
      .set({
        name: workbook.name,
        date: workbook.date,
        level_id: workbook.levelId,
      })
      .where("wid", "=", workbook.wid)
      .execute();
  }

  async delete(wid: string): Promise<void> {
    const client = this.clientManager.getClient();

    await client.deleteFrom("workbooks").where("wid", "=", wid).execute();
  }
}
