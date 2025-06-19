import express from "express";

import QuizUseCase from "@/applications/usecases/QuizUseCase";
import QuizController from "@/interfaces/controllers/QuizController";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager";
import KyselyTransactionManager from "@/interfaces/infra/kysely/KyselyTransactionManager";
import QuizInfra from "@/interfaces/infra/QuizInfra";
import TagInfra from "@/interfaces/infra/TagInfra";
import CategoryInfra from "@/interfaces/infra/CategoryInfra";

const router = express.Router();

const kyselyClientManager = new KyselyClientManager();
const kyselyTransactionManager = new KyselyTransactionManager(
  kyselyClientManager,
);
const quizInfra = new QuizInfra(
  kyselyClientManager,
  new CategoryInfra(kyselyClientManager),
);
const tagInfra = new TagInfra(kyselyClientManager);
const quizUseCase = new QuizUseCase(
  kyselyTransactionManager,
  quizInfra,
  tagInfra,
);
const quizController = new QuizController(quizInfra, quizUseCase);

router.get("/", quizController.get());
router.get("/size", quizController.size());

router.post("/", quizController.post());
router.post("/multiple", quizController.multiplePost());

router.put("/:qid", quizController.put());

router.delete("/:qid", quizController.delete());

module.exports = router;
