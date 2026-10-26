import { Hono } from "hono";
import RegisterUseCase from "@/applications/usecases/RegisterUseCase.js";
import type { AppEnv } from "@/http/context.js";
import { validate } from "@/http/validate.js";
import RegisterController from "@/interfaces/controllers/Register/RegisterController.js";
import { postUnregister } from "@/interfaces/controllers/Register/schema.js";
import CategoryInfra from "@/interfaces/infra/CategoryInfra.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import MylistInfra from "@/interfaces/infra/MylistInfra.js";
import QuizInfra from "@/interfaces/infra/QuizInfra.js";
import RegisteredQuizInfra from "@/interfaces/infra/ResisteredQuizInfra.js";

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
