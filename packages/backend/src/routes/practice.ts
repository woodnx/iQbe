import { Hono } from "hono";
import PracticeUseCase from "@/applications/usecases/PracticeUseCase.js";
import type { AppEnv } from "@/http/context.js";
import { validate } from "@/http/validate.js";
import PracticeController from "@/interfaces/controllers/Practice/PracticeController.js";
import { postPractice } from "@/interfaces/controllers/Practice/schema.js";
import { createReviewService } from "@/interfaces/factories/createReviewService.js";
import CategoryInfra from "@/interfaces/infra/CategoryInfra.js";
import GrowthEventInfra from "@/interfaces/infra/GrowthEventInfra.js";
import HistoryInfra from "@/interfaces/infra/HistoryInfra.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import KyselyTransactionManager from "@/interfaces/infra/kysely/KyselyTransactionManager.js";
import QuizInfra from "@/interfaces/infra/QuizInfra.js";
import UserQuizStateInfra from "@/interfaces/infra/UserQuizStateInfra.js";

// トランザクションを共有するため、全リポジトリに同じ clientManager を渡す。
const kyselyClientManager = new KyselyClientManager();
const practiceUseCase = new PracticeUseCase(
  new KyselyTransactionManager(kyselyClientManager),
  new QuizInfra(kyselyClientManager, new CategoryInfra(kyselyClientManager)),
  new HistoryInfra(kyselyClientManager),
  new UserQuizStateInfra(kyselyClientManager),
  new GrowthEventInfra(kyselyClientManager),
  createReviewService(),
);
const practiceController = new PracticeController(practiceUseCase);

const router = new Hono<AppEnv>().post(
  "/",
  validate("json", postPractice.json),
  practiceController.practice(),
);
export default router;
