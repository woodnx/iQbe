import { ApiError } from "api";

import Workbook from "@/domains/Workbook";
import IWorkbookRepository from "@/domains/Workbook/IWorkbookRepository";

import KyselyClientManager from "./kysely/KyselyClientManager";
import { format } from "@/plugins/day";

export default class WorkbookInfra implements IWorkbookRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async findByWid(wid: string): Promise<Workbook | null> {
    const client = this.clientManager.getClient();

    const workbook = await client
      .selectFrom("workbooks")
      .leftJoin("levels", "workbooks.level_id", "levels.id")
      .innerJoin("users", "creator_id", "users.id")
      .select([
        "workbooks.name as name",
        "wid",
        "workbooks.date",
        "users.uid as creatorUId",
        "levels.color as color",
        "level_id as levelId",
      ])
      .where("workbooks.wid", "=", wid)
      .executeTakeFirst();

    if (!workbook) return null;

    return new Workbook(
      workbook.wid,
      workbook.name,
      workbook.date,
      workbook.creatorUId,
      workbook.levelId,
      workbook.color,
    );
  }

  async findManyByUid(uid: string): Promise<Workbook[]> {
    const client = this.clientManager.getClient();

    const workbooks = await client
      .selectFrom("workbooks")
      .leftJoin("levels", "workbooks.level_id", "levels.id")
      .innerJoin("users", "creator_id", "users.id")
      .select([
        "workbooks.name as name",
        "wid",
        "workbooks.date",
        "users.uid as creatorUId",
        "levels.color as color",
        "level_id as levelId",
      ])
      .where("uid", "=", uid)
      .execute();

    return workbooks.map(
      (w) =>
        new Workbook(w.wid, w.name, w.date, w.creatorUId, w.levelId, w.color),
    );
  }

  async findAll(): Promise<Workbook[]> {
    const client = this.clientManager.getClient();

    const workbooks = await client
      .selectFrom("workbooks")
      .leftJoin("levels", "workbooks.level_id", "levels.id")
      .innerJoin("users", "creator_id", "users.id")
      .select([
        "workbooks.name as name",
        "wid",
        "workbooks.date",
        "users.uid as creatorUId",
        "levels.color as color",
        "level_id as levelId",
      ])
      .execute();

    return workbooks.map(
      (w) =>
        new Workbook(w.wid, w.name, w.date, w.creatorUId, w.levelId, w.color),
    );
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
