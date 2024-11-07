import express from 'express';

import QuizUseCase from '@/applications/usecases/QuizUseCase';
import FavoriteService from '@/domains/Favorite/FavoriteService';
import HistoryService from '@/domains/History/HistoryServise';
import RegisteredQuizService from '@/domains/RegisteredQuiz/ResisteredQuizService';
import QuizController from '@/interfaces/controllers/QuizController';
import FavoriteInfra from '@/interfaces/infra/FavoriteInfra';
import HistoryInfra from '@/interfaces/infra/HistoryInfra';
import KyselyClientManager from '@/interfaces/infra/kysely/KyselyClientManager';
import KyselyTransactionManager from '@/interfaces/infra/kysely/KyselyTransactionManager';
import MylistInfra from '@/interfaces/infra/MylistInfra';
import QuizInfra from '@/interfaces/infra/QuizInfra';
import RegisteredQuizInfra from '@/interfaces/infra/ResisteredQuizInfra';
import UserInfra from '@/interfaces/infra/UserInfra';
import TagInfra from '@/interfaces/infra/TagInfra';

const router = express.Router();

const kyselyClientManager = new KyselyClientManager();
const kyselyTransactionManager = new KyselyTransactionManager(kyselyClientManager);
const quizInfra = new QuizInfra(kyselyClientManager);
const userInfra = new UserInfra(kyselyClientManager);
const mylistInfra = new MylistInfra(kyselyClientManager);
const favoriteInfra = new FavoriteInfra(kyselyClientManager);
const historyInfra = new HistoryInfra(kyselyClientManager);
const tagInfra = new TagInfra(kyselyClientManager);
const registeredQuizInfra = new RegisteredQuizInfra(kyselyClientManager);
const favoriteService = new FavoriteService(
  userInfra,
  quizInfra,
  favoriteInfra,
);
const historyService = new HistoryService(
  userInfra,
  quizInfra,
  historyInfra,
);
const registeredQuizService = new RegisteredQuizService(
  mylistInfra,
  quizInfra,
  registeredQuizInfra,
);
const quizUseCase = new QuizUseCase(
  kyselyTransactionManager,
  quizInfra,
  tagInfra,
);
const quizController = new QuizController(
  quizInfra,
  quizInfra,
  quizUseCase,
  favoriteService,
  historyService,
  registeredQuizService,
);

router.get('/', quizController.get());
router.get('/favorite', quizController.get('/favorite'));
router.get('/history', quizController.get('/history'));
router.get('/mylist/:mid', quizController.get('/mylist/{mid}'));
router.get('/create', quizController.get());

router.post('/', quizController.post());
router.post('/multiple', quizController.multiplePost());
router.post('/favorite', quizController.favorite());
router.post('/history', quizController.practice());
router.post('/mylist/:mid', quizController.register());

router.put('/', quizController.put());
router.post('/workbook/:wid', quizController.addWorkbook());

router.delete('/favorite', quizController.unfavorite());
router.delete('/mylist/:mid', quizController.unregister());
router.delete('/workbook/:wid', quizController.deleteWorkbook());

module.exports = router;
