import { Hono } from "hono";
import FavoriteUseCase from "@/applications/usecases/FavoriteUseCase.js";
import type { AppEnv } from "@/http/context.js";
import { validate } from "@/http/validate.js";
import FavoriteController from "@/interfaces/controllers/Favorite/FavoriteController.js";
import { postLike } from "@/interfaces/controllers/Favorite/schema.js";
import CategoryInfra from "@/interfaces/infra/CategoryInfra.js";
import FavoriteInfra from "@/interfaces/infra/FavoriteInfra.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import QuizInfra from "@/interfaces/infra/QuizInfra.js";
import UserInfra from "@/interfaces/infra/UserInfra.js";

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
  validate("json", postLike.json),
  favoriteController.like(),
);
export default router;
