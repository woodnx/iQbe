import express from 'express';

import AuthUseCase from '@/applications/usecases/AuthUseCase';
import AuthService from '@/domains/Auth/AuthService';
import InviteCodeService from '@/domains/InviteCode/InviteCodeService';
import RefreshTokenService from '@/domains/RefreshToken/RefreshTokenService';
import UserService from '@/domains/User/UserService';
import InviteCodeInfra from '@/interfaces/infra/InviteCodeInfra';
import KyselyClientManager from '@/interfaces/infra/kysely/KyselyClientManager';
import KyselyTransactionManager from '@/interfaces/infra/kysely/KyselyTransactionManager';
import RefreshTokensInfra from '@/interfaces/infra/RefreshTokensInfra';
import UserInfra from '@/interfaces/infra/UserInfra';
import AuthController from '@/interfaces/controllers/AuthController';

const router = express.Router();

const clientManager = new KyselyClientManager();
const inviteCodeInfra = new InviteCodeInfra(clientManager);
const refreshTokenInfra = new RefreshTokensInfra(clientManager);
const userInfra = new UserInfra(clientManager);

const authController = new AuthController(
  new AuthUseCase(
    new KyselyTransactionManager(clientManager),
    new AuthService(),
    new InviteCodeService(inviteCodeInfra),
    inviteCodeInfra,
    new RefreshTokenService(),
    refreshTokenInfra,
    new UserService(userInfra),
    userInfra,
  )
);

router.post('/login', authController.login());
router.post('/signup', authController.signup());
router.post('/token', authController.token());
router.post('/register', authController.register());
router.post('/available', authController.available());

module.exports = router;
