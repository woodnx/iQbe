import express, { Router } from 'express'
import knex from '../plugins/knex'
import dayjs from '../plugins/day'
import { db } from '../database'
import e from 'express'

const router: Router = express.Router()

router.get('/', async (req, res) => {
  const userId = req.userId;

  try {
    const mylists = await db.selectFrom('mylists')
    .select(['name', 'id', 'mid'])
    .where('user_id', '=', userId)
    .execute();
    
    res.status(200).send(mylists);
  } catch(e) {
    console.error(e)
  }
})

router.post('/', async (req, res) => {
  const listName = req.body.listName
  const mid = req.body.mid
  const userId = req.userId
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')

  if (!listName) {
    res.status(400).send('Undefined list name')
    return
  }
    
  try {
    await db.transaction().execute(async trx => {
      const data = {
        user_id: userId,
        name: listName,
        created: now,
        attr: 100,
        mid,
      };

      const inserts = await trx
        .insertInto('mylists')
        .values(data)
        .execute();
      const newList = await trx
        .selectFrom('mylists')
        .selectAll()
        .where('name', '=', listName)
        .execute();
      
      const message = `${inserts.length} new mylists saved (user: ${userId})`;
      
      res.status(201).send(newList);
      console.log(message);
    })
  } catch(e) {
    res.status(400).send('An Error Occured')
    console.error(e)
  }
})

router.put('/quiz', async (req, res) => {
  const quiz_id = req.body.quizId;
  const mylist_id = req.body.mylistId;
  const registered = dayjs().format('YYYY-MM-DD HH:mm:ss');
  
  if (!quiz_id || !mylist_id) {
    res.status(400).send('Undefined quiz id or mylist id');
    return;
  }

  const data = {
    quiz_id,
    mylist_id,
    registered
  };

  try {
    const inserts =await db.transaction().execute(async trx => {
      return await trx
        .insertInto('mylists_quizzes')
        .values(data)
        .execute();
    });

    const message = `${inserts.length} new quizzes saved into mylist (mylist: ${mylist_id})`;
    res.status(201).send(message);
  } catch(e) {
    res.status(400).send('An Error Occurd')
    console.error(e)
  }
})

router.put('/rename', async (req, res) => {
  const mylistId = req.body.mylistId
  const userId = req.userId
  const newName = req.body.newName

  if (!userId || !mylistId || !newName) {
    res.status(400).send(`Undefined user id or mylist id or mylist's name`)
    return
  }

  try {
    const newList = await db.transaction().execute(async trx => {
      const updates = await trx.updateTable('mylists')
      .set({ name: newName })
      .where('id', '=', mylistId)
      .execute();

      return await trx.selectFrom('mylists')
      .select([ 'name', 'id', 'mid' ])
      .where('user_id', '=', userId)
      .execute();
    });

    res.status(200).send(newList)
  } catch(e) {
    res.status(400).send('An Error Occurd')
    console.error(e)
  }
})

router.put('/mid',async (req, res) => {
  const mid = req.body.mid
  const mylistId = req.body.mylistId

  try {
    await db.transaction().execute(async (trx) => {
      trx
      .updateTable('mylists')
      .set({ mid: mid })
      .where('id', '=', mylistId)
      .execute();
    });
  } catch(e) {
    res.status(400).send('An Error Occured')
    console.error(e)
  }
})

router.delete('/quiz', async (req, res) => {
  const quizId = req.body.quizId
  const mylistId = req.body.mylistId

  try {
    await db.transaction().execute(async trx => {
      const deletes = await trx.deleteFrom('mylists_quizzes')
      .where(({ and, eb }) => and([
        eb('mylist_id', '=', mylistId),
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

router.delete('/list', async (req, res) => {
  const mid = req.body.mid
  const userId = req.userId
  
  try {
    const allList = await db.transaction().execute(async trx => {
      await trx
      .deleteFrom('mylists')
      .where('mid', '=', mid)
      .executeTakeFirst();

      return await trx
      .selectFrom('mylists')
      .select([ 'name', 'id', 'mid' ])
      .where('user_id', '=', userId)
      .execute();
    });

    res.status(200).send(allList);
  }catch(e) {
    console.log(e)
    res.status(400).send('An Error Occured')
  }
})

module.exports = router