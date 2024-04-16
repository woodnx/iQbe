import express from 'express';
import WorkbooksController from '@/controllers/WorkbooksController';

const router = express.Router();

router.get('/', WorkbooksController.get);
router.get('/all', WorkbooksController.getAll);
router.post('/', WorkbooksController.post);
router.put('/', WorkbooksController.put);
router.delete('/', WorkbooksController.del);

module.exports = router;
