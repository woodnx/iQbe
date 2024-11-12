import express from 'express';

import CategoryController from '@/interfaces/controllers/CategoryController';
import CategoryInfra from '@/interfaces/infra/CategoryInfra';
import KyselyClientManager from '@/interfaces/infra/kysely/KyselyClientManager';
import SubCategoryInfra from '@/interfaces/infra/SubCategoryInfra';
import CategoryUseCase from '@/applications/usecases/CategoryUseCase';

const clientManager = new KyselyClientManager();
const categoryInfra = new CategoryInfra(clientManager);
const subCategoryInfra = new SubCategoryInfra(clientManager);

const categoryController = new CategoryController(
  new CategoryUseCase(
    categoryInfra,
    subCategoryInfra,
  )
);

const router = express.Router();

router.get('/', categoryController.get());
router.get('/sub', categoryController.getSub());
router.post('/', categoryController.post());
router.post('/sub', categoryController.postSub());

module.exports = router;