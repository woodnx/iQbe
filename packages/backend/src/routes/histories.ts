import express from "express";

import JudgementController from "@/interfaces/controllers/JudgementController";
import JudgementInfra from "@/interfaces/infra/JudgementInfra";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager";

const kyselyClientManager = new KyselyClientManager();
const judgementController = new JudgementController(
  new JudgementInfra(kyselyClientManager),
);

const router = express.Router();

router.get("/:since/:until", judgementController.get());

module.exports = router;
