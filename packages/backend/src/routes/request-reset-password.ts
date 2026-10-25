import express from "express";
import ResetPasswordController from "@/interfaces/controllers/ResetPasswordController.js";
import ResetPasswordUseCase from "@/applications/usecases/ResetPasswordUseCase.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import KyselyTransactionManager from "@/interfaces/infra/kysely/KyselyTransactionManager.js";
import AuthService from "@/domains/Auth/AuthService.js";
import ResetPasswordService from "@/domains/ResetPassword/ResetPasswordService.js";
import ResetPasswordInfra from "@/interfaces/infra/ResetPasswordInfra.js";
import UserInfra from "@/interfaces/infra/UserInfra.js";

const kyselyClientManager = new KyselyClientManager();
const resetPasswordController = new ResetPasswordController(
  new ResetPasswordUseCase(
    new KyselyTransactionManager(kyselyClientManager),
    new AuthService(),
    new ResetPasswordService(),
    new ResetPasswordInfra(kyselyClientManager),
    new UserInfra(kyselyClientManager),
  ),
);

const router = express.Router();

router.post("/", resetPasswordController.request());

export default router;
