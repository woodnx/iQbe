import express, { Router } from 'express'
import { db } from '@/database';
import dayjs from '@/plugins/day'

const router: Router = express.Router();

router.get('/:since/:until', async (req, res) => {
  const since = dayjs(Number(req.params.since)).toDate();
  const until = dayjs(Number(req.params.until)).toDate();
  const user_id = req.userId;

  try {
    const results = await Promise.all(
      [0, 1, 2].map(async i => (
        await db.selectFrom('histories')
        .select(({ fn }) => [
          fn.count('quiz_id').as('count')
        ])
        .where(({ eb, and, between }) => and([
          eb('user_id', '=', user_id),
          eb('judgement', '=', i),
          between('practiced', since, until)
        ]))
        .executeTakeFirst())?.count
    ));
    
    const data = {
      right: results[1] || 0,
      wrong: results[0] || 0,
      through: results[2] || 0,
    };

    res.status(200).send(data);
  } catch(e) {
    console.error(e)
  }
})

router.post('/', async (req, res) => {
  const quiz_id: number = req.body.quizId
  const judgement: number = req.body.judgement
  const practiced: string = dayjs().format('YYYY-MM-DD HH:mm:ss')

  if (!quiz_id || judgement >= 3 || judgement < 0) {
    res.status(400).send('Undefined list name or judgement')
    return
  }

  try {
    const user_id = req.userId

    await db.transaction().execute(async trx => {
      const data = {
        quiz_id,
        user_id,
        practiced,
        judgement,
      };

      const inserts = await trx.insertInto('histories').values(data).execute();
      const updates = await trx.updateTable('quizzes')
      .set(eb => ({
        total_crct_ans:    eb('total_crct_ans',    '+', judgement === 1 ? 1 : 0),
        total_wrng_ans:    eb('total_wrng_ans',    '+', judgement === 0 ? 1 : 0),
        total_through_ans: eb('total_through_ans', '+', judgement === 2 ? 1 : 0),
      }))
      .where('id', '=', quiz_id)
      .execute();
      const message = `${inserts.length} new histories saved`;
      
      res.status(201).send(message);
      console.log(message);
    })
  } catch(e) {
    console.error(e)
    res.status(400).send('An Error Occured')
  }
})

module.exports = router