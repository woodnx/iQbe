import express from 'express';
import { db } from '@/database';
import dayjs from '@/plugins/day';
import MylistsController from '@/controllers/MylistsController';

const router = express.Router();

router.get('/', MylistsController.get);
router.post('/', MylistsController.post);
router.put('/', MylistsController.put);
router.delete('/', MylistsController.delete);

router.put('/quiz', async (req, res) => {
  const quiz_id = req.body.quizId;
  const mid = req.body.mid;
  const registered = dayjs().format('YYYY-MM-DD HH:mm:ss');
  
  if (!quiz_id || !mid) {
    res.status(400).send('Undefined quiz id or mylist id');
    return;
  }

  try {
    const inserts =await db.transaction().execute(async trx => {
      const mylist_id = (await trx
        .selectFrom('mylists')
        .select('id')
        .where('mid', '=', mid)
        .executeTakeFirstOrThrow()
      ).id;

      const data = {
        quiz_id,
        mylist_id,
        registered
      };    

      return await trx
        .insertInto('mylists_quizzes')
        .values(data)
        .execute();
    });

    const message = `${inserts.length} new quizzes saved into mylist (mylist: ${mid})`;
    res.status(201).send(message);
  } catch(e) {
    res.status(400).send('An Error Occurd')
    console.error(e)
  }
})

router.delete('/quiz', async (req, res) => {
  const quizId = req.body.quizId
  const mid = req.body.mid

  try {
    await db.transaction().execute(async trx => {
      const mylsitId = (await trx.selectFrom('mylists')
      .select('id')
      .where('mid', '=', mid)
      .executeTakeFirstOrThrow())?.id

      const deletes = await trx.deleteFrom('mylists_quizzes')
      .where(({ and, eb }) => and([
        eb('mylist_id', '=', mylsitId),
        eb('quiz_id', '=', quizId)
      ]))
      .executeTakeFirst();
    });

    res.status(204).send();
  } catch(e) {
    res.status(400).send('An Error Occured')
    console.error(e)
  }
})


module.exports = router