import express from 'express';
import RequestResetPasswordController from '@/controllers/RequestResetPasswordController';

const router = express.Router();

router.post('/', RequestResetPasswordController.post);

module.exports = router;