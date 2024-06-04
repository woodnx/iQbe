import express from 'express';

import CategoryService from '@/domains/Category/CategoryService';
import CategoryController from '@/interfaces/controllers/CategoryController';
import CategoryInfra from '@/interfaces/infra/CategoryInfra';
import KyselyClientManager from '@/interfaces/infra/kysely/KyselyClientManager';
import SubCategoryInfra from '@/interfaces/infra/SubCategoryInfra';

const clientManager = new KyselyClientManager();
const categoryInfra = new CategoryInfra(clientManager);
const subCategoryInfra = new SubCategoryInfra(clientManager);

const categoryController = new CategoryController(
  new CategoryService(
    categoryInfra,
    subCategoryInfra    
  ),
  subCategoryInfra,
);

const router = express.Router();

router.get('/', categoryController.get());
router.get('/sub', categoryController.getSub());

module.exports = router;