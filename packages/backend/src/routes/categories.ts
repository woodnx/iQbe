import express from 'express';

import CategoryController from '@/interfaces/controllers/CategoryController';
import CategoryInfra from '@/interfaces/infra/CategoryInfra';
import KyselyClientManager from '@/interfaces/infra/kysely/KyselyClientManager';
import CategoryUseCase from '@/applications/usecases/CategoryUseCase';

const clientManager = new KyselyClientManager();
const categoryInfra = new CategoryInfra(clientManager);

const categoryController = new CategoryController(
  categoryInfra,
  new CategoryUseCase(categoryInfra),
);

const router = express.Router();

router.get('/', categoryController.get());
router.post('/', categoryController.post());

module.exports = router;