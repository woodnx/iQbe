import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import {
  getMylists,
  postMylists,
  putMylists,
  deleteMylists,
  putMylistsQuiz,
  deleteMylistsQuiz,
} from "@/http/schemas.js";
import { validate } from "@/http/validate.js";

import { db } from "@/database.js";
import MylistService from "@/domains/Mylist/MylistService.js";
import MylistController from "@/interfaces/controllers/MylistController.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import MylistInfra from "@/interfaces/infra/MylistInfra.js";
import dayjs from "@/plugins/day.js";

const clientManager = new KyselyClientManager();
const mylistInfra = new MylistInfra(clientManager);

const mylistController = new MylistController(mylistInfra, new MylistService());

const router = new Hono<AppEnv>()
  .get("/", mylistController.get())
  .post("/", validate("json", postMylists.json), mylistController.post())
  .put("/", validate("json", putMylists.json), mylistController.put())
  .delete("/", validate("json", deleteMylists.json), mylistController.delete())
  .put("/quiz", validate("json", putMylistsQuiz.json), async (c) => {
    const body = c.req.valid("json");
    const quiz_id = body.quizId;
    const mid = body.mid;
    const registered = dayjs().format("YYYY-MM-DD HH:mm:ss");

    if (!quiz_id || !mid) {
      return c.text("Undefined quiz id or mylist id", 400);
    }

    try {
      const inserts = await db.transaction().execute(async (trx) => {
        const mylist_id = (
          await trx
            .selectFrom("mylists")
            .select("id")
            .where("mid", "=", mid)
            .executeTakeFirstOrThrow()
        ).id;

        const data = {
          quiz_id,
          mylist_id,
          registered,
        };

        return await trx.insertInto("mylists_quizzes").values(data).execute();
      });

      const message = `${inserts.length} new quizzes saved into mylist (mylist: ${mid})`;
      return c.text(message, 201);
    } catch (e) {
      console.error(e);
      return c.text("An Error Occurd", 400);
    }
  })
  .delete("/quiz", validate("json", deleteMylistsQuiz.json), async (c) => {
    const body = c.req.valid("json");
    const quizId = body.quizId;
    const mid = body.mid;

    try {
      await db.transaction().execute(async (trx) => {
        const mylsitId = (
          await trx
            .selectFrom("mylists")
            .select("id")
            .where("mid", "=", mid)
            .executeTakeFirstOrThrow()
        )?.id;

        const deletes = await trx
          .deleteFrom("mylists_quizzes")
          .where(({ and, eb }) =>
            and([eb("mylist_id", "=", mylsitId), eb("quiz_id", "=", quizId)]),
          )
          .executeTakeFirst();
      });

      return c.body(null, 204);
    } catch (e) {
      console.error(e);
      return c.text("An Error Occured", 400);
    }
  });
export default router;
