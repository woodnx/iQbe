import express from "express";

import RegisterUseCase from "@/applications/usecases/RegisterUseCase";
import RegisterController from "@/interfaces/controllers/RegisterController";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager";
import MylistInfra from "@/interfaces/infra/MylistInfra";
import QuizInfra from "@/interfaces/infra/QuizInfra";
import RegisteredQuizInfra from "@/interfaces/infra/ResisteredQuizInfra";
import CategoryInfra from "@/interfaces/infra/CategoryInfra";

const router = express.Router();
const kyselyClientManager = new KyselyClientManager();
const registerController = new RegisterController(
  new RegisterUseCase(
    new MylistInfra(kyselyClientManager),
    new QuizInfra(kyselyClientManager, new CategoryInfra(kyselyClientManager)),
    new RegisteredQuizInfra(kyselyClientManager),
  ),
);

router.post("/", registerController.register());

module.exports = router;
