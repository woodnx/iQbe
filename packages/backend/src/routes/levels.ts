import express from 'express';
import LevelsController from '@/controllers/LevelsController';

const router = express.Router();

router.get('/', LevelsController.get);

module.exports = router;