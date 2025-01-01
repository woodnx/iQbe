import express from 'express';

import AuthUseCase from '@/applications/usecases/AuthUseCase';
import InviteCodeInfra from '@/interfaces/infra/InviteCodeInfra';
import KyselyClientManager from '@/interfaces/infra/kysely/KyselyClientManager';
import KyselyTransactionManager from '@/interfaces/infra/kysely/KyselyTransactionManager';
import RefreshTokensInfra from '@/interfaces/infra/RefreshTokensInfra';
import UserInfra from '@/interfaces/infra/UserInfra';
import AuthController from '@/interfaces/controllers/AuthController';

const router = express.Router();

const clientManager = new KyselyClientManager();

const authController = new AuthController(
  new AuthUseCase(
    new KyselyTransactionManager(clientManager),
    new InviteCodeInfra(clientManager),
    new RefreshTokensInfra(clientManager),
    new UserInfra(clientManager),
  )
);

router.post('/login', authController.login());
router.post('/signup', authController.signup());
router.post('/token', authController.token());
router.post('/register', authController.register());
router.post('/available', authController.available());

module.exports = router;
