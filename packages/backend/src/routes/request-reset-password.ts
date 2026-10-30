import { Hono } from "hono";
import ResetPasswordUseCase from "@/applications/usecases/ResetPasswordUseCase.js";
import AuthService from "@/domains/Auth/AuthService.js";
import ResetPasswordService from "@/domains/ResetPassword/ResetPasswordService.js";
import type { AppEnv } from "@/http/context.js";
import { validate } from "@/http/validate.js";
import ResetPasswordController from "@/interfaces/controllers/ResetPassword/ResetPasswordController.js";
import { postRequestResetPassword } from "@/interfaces/controllers/ResetPassword/schema.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import KyselyTransactionManager from "@/interfaces/infra/kysely/KyselyTransactionManager.js";
import ResetPasswordInfra from "@/interfaces/infra/ResetPasswordInfra.js";
import RefreshTokensInfra from "@/interfaces/infra/RefreshTokensInfra.js";
import UserInfra from "@/interfaces/infra/UserInfra.js";

const kyselyClientManager = new KyselyClientManager();
const resetPasswordController = new ResetPasswordController(
  new ResetPasswordUseCase(
    new KyselyTransactionManager(kyselyClientManager),
    new AuthService(),
    new ResetPasswordService(),
    new ResetPasswordInfra(kyselyClientManager),
    new UserInfra(kyselyClientManager),
    new RefreshTokensInfra(kyselyClientManager),
  ),
);

const router = new Hono<AppEnv>().post(
  "/",
  validate("json", postRequestResetPassword.json),
  resetPasswordController.request(),
);
export default router;
