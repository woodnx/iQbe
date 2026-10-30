import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import { validate } from "@/http/validate.js";
import LevelController from "@/interfaces/controllers/Level/LevelController.js";
import { getLevels } from "@/interfaces/controllers/Level/schema.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import LevelInfra from "@/interfaces/infra/LevelInfra.js";

const clientManager = new KyselyClientManager();
const levelController = new LevelController(new LevelInfra(clientManager));

const router = new Hono<AppEnv>().get("/", levelController.get());
export default router;
