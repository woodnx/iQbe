import express from "express";

import PracticeUseCase from "@/applications/usecases/PracticeUseCase.js";
import QuizInfra from "@/interfaces/infra/QuizInfra.js";
import UserInfra from "@/interfaces/infra/UserInfra.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import HistoryInfra from "@/interfaces/infra/HistoryInfra.js";
import PracticeController from "@/interfaces/controllers/PracticeController.js";
import CategoryInfra from "@/interfaces/infra/CategoryInfra.js";

const router = express.Router();
const kyselyClientManager = new KyselyClientManager();
const practiceUseCase = new PracticeUseCase(
  new UserInfra(kyselyClientManager),
  new QuizInfra(kyselyClientManager, new CategoryInfra(kyselyClientManager)),
  new HistoryInfra(kyselyClientManager),
);
const practiceController = new PracticeController(practiceUseCase);

router.post("/", practiceController.practice());

export default router;
