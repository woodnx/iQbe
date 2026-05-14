import express from "express";
import HistoryController from "@/interfaces/controllers/HistoryController";
import JudgementController from "@/interfaces/controllers/JudgementController";
import HistoryInfra from "@/interfaces/infra/HistoryInfra";
import JudgementInfra from "@/interfaces/infra/JudgementInfra";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager";

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

module.exports = router;
