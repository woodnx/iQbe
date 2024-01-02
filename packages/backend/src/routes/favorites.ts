import express from 'express';
import { db } from '@/database';
import dayjs from '@/plugins/day';

const router = express.Router()

router.post('/', async (req, res) => {
  const userId = req.userId;
  const quizId = req.body.quizId;
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

  try {
    const data = {
      user_id: userId,
      quiz_id: quizId,
      registered: now,
    };

    const inserts = await db.transaction().execute(async (trx) => {
      return await trx.insertInto('favorites')
      .values(data)
      .execute();
    });
    const message = `${inserts.length} new quizzes saved`;
    
    res.status(201).send(message);
    console.log(message);
  }catch(e){
    console.error(e);
    res.status(400).send('An Error Occured');
  }
})

router.delete('/', async (req, res) => {
  const userId = req.userId;
  const quizId = req.body.quizId;

  try {
    const deleted = await db.transaction().execute(async (trx) => {
      return await trx.deleteFrom('favorites')
      .where(({ eb, and }) => and([
        eb('user_id', '=', userId),
        eb('quiz_id', '=', quizId),
      ]))
      .execute();
    });

    res.status(204).send()
  } catch(e) {
    console.error(e)
    res.status(400).send('An Error Occured')
  }
})

module.exports = router