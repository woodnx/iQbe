import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import { postUnregister } from "@/http/schemas.js";
import { validate } from "@/http/validate.js";

import RegisterUseCase from "@/applications/usecases/RegisterUseCase.js";
import RegisterController from "@/interfaces/controllers/RegisterController.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import MylistInfra from "@/interfaces/infra/MylistInfra.js";
import QuizInfra from "@/interfaces/infra/QuizInfra.js";
import RegisteredQuizInfra from "@/interfaces/infra/ResisteredQuizInfra.js";
import CategoryInfra from "@/interfaces/infra/CategoryInfra.js";

const kyselyClientManager = new KyselyClientManager();
const registerController = new RegisterController(
  new RegisterUseCase(
    new MylistInfra(kyselyClientManager),
    new QuizInfra(kyselyClientManager, new CategoryInfra(kyselyClientManager)),
    new RegisteredQuizInfra(kyselyClientManager),
  ),
);

const router = new Hono<AppEnv>().post(
  "/",
  validate("json", postUnregister.json),
  registerController.unregister(),
);
export default router;
