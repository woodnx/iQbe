import express from "express";

import AuthUseCase from "@/applications/usecases/AuthUseCase.js";
import InviteCodeInfra from "@/interfaces/infra/InviteCodeInfra.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import KyselyTransactionManager from "@/interfaces/infra/kysely/KyselyTransactionManager.js";
import RefreshTokensInfra from "@/interfaces/infra/RefreshTokensInfra.js";
import UserInfra from "@/interfaces/infra/UserInfra.js";
import AuthController from "@/interfaces/controllers/AuthController.js";

const router = express.Router();

const clientManager = new KyselyClientManager();

const authController = new AuthController(
  new AuthUseCase(
    new KyselyTransactionManager(clientManager),
    new InviteCodeInfra(clientManager),
    new RefreshTokensInfra(clientManager),
    new UserInfra(clientManager),
  ),
);

router.post("/login", authController.login());
router.post("/signup", authController.signup());
router.post("/token", authController.token());
router.post("/register", authController.register());
router.post("/available", authController.available());

export default router;
