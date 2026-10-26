import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import { getTags } from "@/http/schemas.js";
import { validate } from "@/http/validate.js";
import TagController from "@/interfaces/controllers/TagController.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import TagInfra from "@/interfaces/infra/TagInfra.js";

const tagController = new TagController(
  new TagInfra(new KyselyClientManager()),
);

const router = new Hono<AppEnv>().get(
  "/",
  validate("query", getTags.query),
  tagController.get(),
);
export default router;
