import express from 'express';
import HistoriesController from '@/controllers/HistoriesController';

const router = express.Router();

router.get('/:since/:until', HistoriesController.getSinceUntil);

module.exports = router;