import express from "express";
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

const router = express.Router();

router.get("/", historyController.get());
router.get("/:since/:until", judgementController.get());

export default router;
