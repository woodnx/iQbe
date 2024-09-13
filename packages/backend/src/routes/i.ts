import IController from '@/interfaces/controllers/IController';
import KyselyClientManager from '@/interfaces/infra/kysely/KyselyClientManager';
import UserInfra from '@/interfaces/infra/UserInfra';
import express, { Router } from 'express';

const router: Router = express.Router();

const kyselyClientManager = new KyselyClientManager();
const userInfra = new UserInfra(kyselyClientManager);
const iController = new IController(userInfra);

router.get("/", iController.get());

module.exports = router;