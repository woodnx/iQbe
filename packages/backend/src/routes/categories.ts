import express from 'express';
import CategoriesController from '@/controllers/CategoriesController';

const router = express.Router();

router.get('/', CategoriesController.get);

router.get('/sub', CategoriesController.getSub);

module.exports = router