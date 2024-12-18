import InviteCodeController from '@/interfaces/controllers/InviteCodeController';
import InviteCodeInfra from '@/interfaces/infra/InviteCodeInfra';
import KyselyClientManager from '@/interfaces/infra/kysely/KyselyClientManager';
import express from 'express';

const inviteCodeController = new InviteCodeController(
  new InviteCodeInfra(new KyselyClientManager()),
)

const router = express.Router();

router.get('/', inviteCodeController.get());
router.post('/', inviteCodeController.create());

module.exports = router;