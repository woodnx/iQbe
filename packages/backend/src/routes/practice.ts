import express from 'express';

import PracticeUseCase from '@/applications/usecases/PracticeUseCase';
import QuizInfra from '@/interfaces/infra/QuizInfra';
import UserInfra from '@/interfaces/infra/UserInfra';
import KyselyClientManager from '@/interfaces/infra/kysely/KyselyClientManager';
import HistoryInfra from '@/interfaces/infra/HistoryInfra';
import PracticeController from '@/interfaces/controllers/PracticeController';

const router = express.Router();
const kyselyClientManager = new KyselyClientManager();
const practiceUseCase = new PracticeUseCase(
  new UserInfra(kyselyClientManager),
  new QuizInfra(kyselyClientManager),
  new HistoryInfra(kyselyClientManager),
);
const practiceController = new PracticeController(practiceUseCase);

router.post('/', practiceController.practice());

module.exports = router;
