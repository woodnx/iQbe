import express from 'express';
import { db } from '../database';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await db.selectFrom('categories').selectAll().execute();
    res.send(categories)
  } catch(e) {
    console.error(e);
    res.send('An Error Occured');
  }
});

router.get('/sub', async (req, res) => {
  try {
    const categories = await db.selectFrom('sub_categories').selectAll().execute();
    res.send(categories);
  } catch(e) {
    console.error(e);
    res.send('An Error Occured');
  }
});

router.post('/quiz', async (req, res) => {
  const quizId = Number(req.body.quizId);
  const category = Number(req.body.category);
  const subCategory = category !== 0 ? Number(req.body.subcategory) : 0;
  const userId = req.body.userId;

  try {
    await db.transaction().execute(async trx => {
      const registerd = await trx.selectFrom('quizzes_categories').selectAll().execute();
      
      if (!registerd.filter(data => data.quiz_id === quizId)) {
        const data = {
          user_id: userId,
          quiz_id: quizId,
          category_id: category,
          sub_category_id: subCategory,
        };

        const inserts = await trx
        .insertInto('quizzes_categories')
        .values(data)
        .execute();

        const message = `${inserts.length} new categories saved`
        res.status(201).send(message)
        console.log(message)
      }
    })
  }catch(e) {
    console.error(e)
    res.status(400).send('An Error Occured')
  }

})

module.exports = router