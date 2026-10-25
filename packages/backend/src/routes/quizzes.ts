import express from "express";

import { AddQuizUseCase } from "@/applications/usecases/Quiz/AddQuizUseCase.js";
import { DeleteQuizUseCase } from "@/applications/usecases/Quiz/DeleteQuizUseCase.js";
import { EditQuizUseCase } from "@/applications/usecases/Quiz/EditQuizUseCase.js";
import QuizController from "@/interfaces/controllers/QuizController.js";
import CategoryInfra from "@/interfaces/infra/CategoryInfra.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import KyselyTransactionManager from "@/interfaces/infra/kysely/KyselyTransactionManager.js";
import { QuizAssignedTagsInfra } from "@/interfaces/infra/QuizAssignedTags.js";
import QuizInfra from "@/interfaces/infra/QuizInfra.js";
import TagInfra from "@/interfaces/infra/TagInfra.js";

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
const quizAssignedTagsInfra = new QuizAssignedTagsInfra(kyselyClientManager);
const addQuizUseCase = new AddQuizUseCase(
  kyselyTransactionManager,
  quizInfra,
  tagInfra,
  quizAssignedTagsInfra,
);
const editQuizUseCase = new EditQuizUseCase(
  kyselyTransactionManager,
  quizInfra,
  tagInfra,
  quizAssignedTagsInfra,
);
const deleteQuizUseCase = new DeleteQuizUseCase(
  kyselyTransactionManager,
  quizInfra,
  tagInfra,
  quizAssignedTagsInfra,
);
const quizController = new QuizController(
  quizInfra,
  addQuizUseCase,
  editQuizUseCase,
  deleteQuizUseCase,
);

router.get("/", quizController.get());
router.get("/size", quizController.size());

router.post("/", quizController.post());
router.post("/multiple", quizController.multiplePost());

router.put("/:qid", quizController.put());

router.delete("/:qid", quizController.delete());

export default router;
