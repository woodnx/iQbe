import { Hono } from "hono";
import PracticeUseCase from "@/applications/usecases/PracticeUseCase.js";
import type { AppEnv } from "@/http/context.js";
import { validate } from "@/http/validate.js";
import PracticeController from "@/interfaces/controllers/Practice/PracticeController.js";
import { postPractice } from "@/interfaces/controllers/Practice/schema.js";
import CategoryInfra from "@/interfaces/infra/CategoryInfra.js";
import HistoryInfra from "@/interfaces/infra/HistoryInfra.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import QuizInfra from "@/interfaces/infra/QuizInfra.js";
import UserInfra from "@/interfaces/infra/UserInfra.js";

const kyselyClientManager = new KyselyClientManager();
const practiceUseCase = new PracticeUseCase(
  new UserInfra(kyselyClientManager),
  new QuizInfra(kyselyClientManager, new CategoryInfra(kyselyClientManager)),
  new HistoryInfra(kyselyClientManager),
);
const practiceController = new PracticeController(practiceUseCase);

const router = new Hono<AppEnv>().post(
  "/",
  validate("json", postPractice.json),
  practiceController.practice(),
);
export default router;
