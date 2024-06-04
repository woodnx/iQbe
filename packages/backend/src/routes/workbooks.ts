import express from 'express';

import WorkbookService from '@/domains/Workbook/WorkbookService';
import WorkbookController from '@/interfaces/controllers/WorkbookController';
import KyselyClientManager from '@/interfaces/infra/kysely/KyselyClientManager';
import WorkbookInfra from '@/interfaces/infra/WorkbookInfra';

const clientManager = new KyselyClientManager();
const workbookInfra = new WorkbookInfra(clientManager)
const workbookController = new WorkbookController(
  workbookInfra,
  new WorkbookService,
);

const router = express.Router();

router.get('/', workbookController.get());
router.get('/all', workbookController.getAll());
router.post('/', workbookController.post());
router.put('/', workbookController.put());
router.delete('/', workbookController.delete());

module.exports = router;
