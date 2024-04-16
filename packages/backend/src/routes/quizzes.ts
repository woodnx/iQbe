import express from 'express'
import QuizzesController from '@/controllers/QuizzesController';

const router = express.Router();

router.get('/', QuizzesController.get);
router.get('/favorite', QuizzesController.getFavorite);
router.get('/history', QuizzesController.getHistory);
router.get('/mylist/:mid', QuizzesController.getMylist);
router.get('/create', QuizzesController.getCreate);

router.post('/', QuizzesController.post);
router.post('/favorite', QuizzesController.postFavorite);
router.post('/history', QuizzesController.postHistory);
router.post('/mylist/:mid', QuizzesController.postMylist);

router.put('/', QuizzesController.put);
router.post('/workbook/:wid', QuizzesController.postWorkbook);

router.delete('/favorite', QuizzesController.deleteFavorite);
router.delete('/mylist/:mid', QuizzesController.deleteMylist);
router.delete('/workbook/:wid', QuizzesController.deleteWorkbook);

module.exports = router;
