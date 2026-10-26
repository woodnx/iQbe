import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import { postUnlike } from "@/http/schemas.js";
import { validate } from "@/http/validate.js";

import FavoriteUseCase from "@/applications/usecases/FavoriteUseCase.js";
import FavoriteController from "@/interfaces/controllers/FavoriteController.js";
import FavoriteInfra from "@/interfaces/infra/FavoriteInfra.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import QuizInfra from "@/interfaces/infra/QuizInfra.js";
import UserInfra from "@/interfaces/infra/UserInfra.js";
import CategoryInfra from "@/interfaces/infra/CategoryInfra.js";

const kyselyClientManager = new KyselyClientManager();
const favoriteController = new FavoriteController(
  new FavoriteUseCase(
    new FavoriteInfra(kyselyClientManager),
    new QuizInfra(kyselyClientManager, new CategoryInfra(kyselyClientManager)),
    new UserInfra(kyselyClientManager),
  ),
);

const router = new Hono<AppEnv>().post(
  "/",
  validate("json", postUnlike.json),
  favoriteController.unlike(),
);
export default router;
