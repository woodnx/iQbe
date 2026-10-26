import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import {
  getQuizzes,
  getQuizzesSize,
  postQuizzes,
  postQuizzesMultiple,
  putQuizzesQid,
  deleteQuizzesQid,
} from "@/http/schemas.js";
import { validate } from "@/http/validate.js";

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

const router = new Hono<AppEnv>()
  .get("/", validate("query", getQuizzes.query), quizController.get())
  .get("/size", validate("query", getQuizzesSize.query), quizController.size())
  .post("/", validate("json", postQuizzes.json), quizController.post())
  .post(
    "/multiple",
    validate("json", postQuizzesMultiple.json),
    quizController.multiplePost(),
  )
  .put(
    "/:qid",
    validate("param", putQuizzesQid.param),
    validate("json", putQuizzesQid.json),
    quizController.put(),
  )
  .delete(
    "/:qid",
    validate("param", deleteQuizzesQid.param),
    quizController.delete(),
  );
export default router;
