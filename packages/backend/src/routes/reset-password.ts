import express from 'express';
import ResetPasswordController from '@/controllers/ResetPasswordController';

const router = express.Router();

router.post('/', ResetPasswordController.post);

module.exports = router;