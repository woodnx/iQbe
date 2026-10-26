import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import {
  postAuthLogin,
  postAuthSignup,
  postAuthToken,
  postAuthRegister,
  postAuthAvailable,
} from "@/http/schemas.js";
import { validate } from "@/http/validate.js";

import AuthUseCase from "@/applications/usecases/AuthUseCase.js";
import InviteCodeInfra from "@/interfaces/infra/InviteCodeInfra.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import KyselyTransactionManager from "@/interfaces/infra/kysely/KyselyTransactionManager.js";
import RefreshTokensInfra from "@/interfaces/infra/RefreshTokensInfra.js";
import UserInfra from "@/interfaces/infra/UserInfra.js";
import AuthController from "@/interfaces/controllers/AuthController.js";

const clientManager = new KyselyClientManager();

const authController = new AuthController(
  new AuthUseCase(
    new KyselyTransactionManager(clientManager),
    new InviteCodeInfra(clientManager),
    new RefreshTokensInfra(clientManager),
    new UserInfra(clientManager),
  ),
);

const router = new Hono<AppEnv>()
  .post("/login", validate("json", postAuthLogin.json), authController.login())
  .post(
    "/signup",
    validate("json", postAuthSignup.json),
    authController.signup(),
  )
  .post("/token", validate("json", postAuthToken.json), authController.token())
  .post(
    "/register",
    validate("json", postAuthRegister.json),
    authController.register(),
  )
  .post(
    "/available",
    validate("json", postAuthAvailable.json),
    authController.available(),
  );
export default router;
