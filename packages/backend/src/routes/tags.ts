import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import { validate } from "@/http/validate.js";
import { getTags } from "@/interfaces/controllers/Tag/schema.js";
import TagController from "@/interfaces/controllers/Tag/TagController.js";
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
