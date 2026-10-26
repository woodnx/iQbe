import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import { getLevels } from "@/http/schemas.js";
import { validate } from "@/http/validate.js";

import LevelController from "@/interfaces/controllers/LevelController.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import LevelInfra from "@/interfaces/infra/LevelInfra.js";

const clientManager = new KyselyClientManager();
const levelController = new LevelController(new LevelInfra(clientManager));

const router = new Hono<AppEnv>().get("/", levelController.get());
export default router;
