import express from 'express';
import AuthController from '@/controllers/AuthController';

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/signup', AuthController.signup);
router.post('/token', AuthController.token);
router.post('/register', AuthController.register);
router.post('/available', AuthController.available);

module.exports = router;
