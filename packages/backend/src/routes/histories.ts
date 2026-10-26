import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import { getHistories, getHistoriesSinceUntil } from "@/http/schemas.js";
import { validate } from "@/http/validate.js";
import HistoryController from "@/interfaces/controllers/HistoryController.js";
import JudgementController from "@/interfaces/controllers/JudgementController.js";
import HistoryInfra from "@/interfaces/infra/HistoryInfra.js";
import JudgementInfra from "@/interfaces/infra/JudgementInfra.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";

const kyselyClientManager = new KyselyClientManager();
const historyController = new HistoryController(
  new HistoryInfra(kyselyClientManager),
);
const judgementController = new JudgementController(
  new JudgementInfra(kyselyClientManager),
);

const router = new Hono<AppEnv>()
  .get("/", historyController.get())
  .get(
    "/:since/:until",
    validate("param", getHistoriesSinceUntil.param),
    judgementController.get(),
  );
export default router;
