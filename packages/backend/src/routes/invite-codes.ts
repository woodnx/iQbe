import express from 'express';
import InviteCodeController from '@/controllers/InviteCodeController';

const router = express.Router();

router.post('/', InviteCodeController.get);

module.exports = router;