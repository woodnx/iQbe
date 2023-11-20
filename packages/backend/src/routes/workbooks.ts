import express, { Router } from 'express';
import { db } from '@/database';

const router: Router = express.Router();

router.get('/', async (req, res) => {
  try {
    const workbooks = await db.selectFrom('workbooks').selectAll().execute();
    res.status(200).send(workbooks)
  } catch(err) {
    console.error(err)
  } 
})

router.get('/color', async (req, res) => {
  try {
    const workbooks = await db.selectFrom('workbooks')
    .innerJoin('levels', 'workbooks.level_id', 'levels.id')
    .select([
      'workbooks.id as id',
      'workbooks.name as label',
      'levels.color as color',
    ])
    .execute();

    res.status(200).send(workbooks)
  } catch(err) {
    console.error(err)
  } 
})

module.exports = router