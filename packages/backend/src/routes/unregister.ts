import express from "express";

import RegisterUseCase from "@/applications/usecases/RegisterUseCase.js";
import RegisterController from "@/interfaces/controllers/RegisterController.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import MylistInfra from "@/interfaces/infra/MylistInfra.js";
import QuizInfra from "@/interfaces/infra/QuizInfra.js";
import RegisteredQuizInfra from "@/interfaces/infra/ResisteredQuizInfra.js";
import CategoryInfra from "@/interfaces/infra/CategoryInfra.js";

const router = express.Router();
const kyselyClientManager = new KyselyClientManager();
const registerController = new RegisterController(
  new RegisterUseCase(
    new MylistInfra(kyselyClientManager),
    new QuizInfra(kyselyClientManager, new CategoryInfra(kyselyClientManager)),
    new RegisteredQuizInfra(kyselyClientManager),
  ),
);

router.post("/", registerController.unregister());

export default router;
