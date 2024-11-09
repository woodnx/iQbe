import express from 'express';

import FavoriteUseCase from '@/applications/usecases/FavoriteUseCase';
import FavoriteController from '@/interfaces/controllers/FavoriteController';
import FavoriteInfra from '@/interfaces/infra/FavoriteInfra';
import KyselyClientManager from '@/interfaces/infra/kysely/KyselyClientManager';
import QuizInfra from '@/interfaces/infra/QuizInfra';
import UserInfra from '@/interfaces/infra/UserInfra';

const router = express.Router();

const kyselyClientManager = new KyselyClientManager();
const favoriteController = new FavoriteController(
  new FavoriteUseCase(
    new FavoriteInfra(kyselyClientManager),
    new QuizInfra(kyselyClientManager),
    new UserInfra(kyselyClientManager),
  )
);

router.post('/', favoriteController.like());

export default router;