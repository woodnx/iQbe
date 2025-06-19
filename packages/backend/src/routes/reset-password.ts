import express from "express";
import ResetPasswordController from "@/interfaces/controllers/ResetPasswordController";
import ResetPasswordUseCase from "@/applications/usecases/ResetPasswordUseCase";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager";
import KyselyTransactionManager from "@/interfaces/infra/kysely/KyselyTransactionManager";
import AuthService from "@/domains/Auth/AuthService";
import ResetPasswordService from "@/domains/ResetPassword/ResetPasswordService";
import ResetPasswordInfra from "@/interfaces/infra/ResetPasswordInfra";
import UserInfra from "@/interfaces/infra/UserInfra";

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

router.post("/", resetPasswordController.reset());

module.exports = router;
