import TagService from '@/domains/Tag/TagService';
import TagController from '@/interfaces/controllers/TagController';
import KyselyClientManager from '@/interfaces/infra/kysely/KyselyClientManager';
import TagInfra from '@/interfaces/infra/TagInfra';
import express from 'express';

const router = express.Router();

const tagController = new TagController(
  new TagService(),
  new TagInfra(new KyselyClientManager()),
)

router.get('/', tagController.get());
router.post('/', tagController.post());
router.put('/', tagController.put());
router.delete('/', tagController.delete());

module.exports = router;
