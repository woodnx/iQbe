import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import { getInviteCode, postInviteCode } from "@/http/schemas.js";
import { validate } from "@/http/validate.js";
import InviteCodeController from "@/interfaces/controllers/InviteCodeController.js";
import InviteCodeInfra from "@/interfaces/infra/InviteCodeInfra.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";

const inviteCodeController = new InviteCodeController(
  new InviteCodeInfra(new KyselyClientManager()),
);

const router = new Hono<AppEnv>()
  .get("/", validate("query", getInviteCode.query), inviteCodeController.get())
  .post("/", inviteCodeController.create());
export default router;
