import IController from '@/controllers/IController';
import express from 'express';

const router = express.Router();

router.get('/', IController.get);

module.exports = router;