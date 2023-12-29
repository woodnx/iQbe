import express, { NextFunction, Request, Response, Router } from 'express';
import { db } from '@/database';
import Hashids from 'hashids';

const router: Router = express.Router();
const hashids = new Hashids(process.env.HASHIDS_SALT, 10, process.env.HASHIDS_ALPHABET);

async function setWid(req: Request, res: Response, next: NextFunction) {
  try {
    const workbooks = await db.selectFrom('workbooks')
    .selectAll()
    .execute();
    
    for (const w of workbooks) {
      if (!w.wid) {
        const workbookId = w.id;

        const wid = hashids.encode(workbookId);

        await db.transaction().execute(async (trx) => {
          trx
          .updateTable('workbooks')
          .set({ wid })
          .where('id', '=', w.id)
          .execute();
        });
      }
    }
    next();
  } catch(e) {
    console.error(e);
  }
}

router.get('/', setWid, async (req, res) => {
  try {
    const workbooks = await db.selectFrom('workbooks')
    .select(['name', 'wid', 'creator_id', 'date'])
    .execute();

    res.status(200).send(workbooks);
  } catch(err) {
    console.error(err);
  } 
});

router.get('/color', setWid, async (req, res) => {
  try {
    const workbooks = await db.selectFrom('workbooks')
    .innerJoin('levels', 'workbooks.level_id', 'levels.id')
    .select([
      'workbooks.id as id',
      'workbooks.name as label',
      'levels.color as color',
    ])
    .execute();

    res.status(200).send(workbooks);
  } catch(err) {
    console.error(err);
  } 
});

router.get('/user', setWid, async (req, res) => {
  const userId = req.userId;

  try {
    const workbooks = await db.selectFrom('workbooks')
    .select(['name', 'wid', 'creator_id', 'date'])
    .where('creator_id', '=', userId)
    .execute();

    res.status(200).send(workbooks);
  } catch(err) {
    console.error(err);
  }
});

router.post('/new', async (req, res) => {
  const workbookName = req.body.listName;
  const userId = req.userId;

  try {
    const newList = await db.transaction().execute(async (trx) => {
      const lastWorkbook = await trx.selectFrom('workbooks').select('id').orderBy('id desc').limit(1).execute();
      const lastlastWorkbookId = lastWorkbook.length !== 0 ? lastWorkbook[0].id : 0;
      const wid = hashids.encode(lastlastWorkbookId + 1);

      trx.insertInto('workbooks')
      .values({
        name: workbookName,
        creator_id: userId,
        wid,
      })
      .execute();

      return await trx.selectFrom('workbooks')
      .select([ 'name', 'id', 'creator_id' ])
      .where('creator_id', '=', userId)
      .execute();
    });

    res.status(200).send(newList);
  } catch(err) {
    console.error(err);
  }
});

router.put('/rename', async (req, res) => {
  const workbookName = req.body.newName;
  const wid = req.body.wid;
  const userId = req.userId;

  try {
    const newList = await db.transaction().execute(async (trx) => {
      await trx.updateTable('workbooks')
      .set({
        name: workbookName,
      })
      .where('wid', '=', wid)
      .execute();

      return await trx.selectFrom('workbooks')
      .select([ 'name', 'id', 'creator_id' ])
      .where('creator_id', '=', userId)
      .execute();
    });

    res.status(200).send(newList);
  } catch(err) {
    console.error(err);
  }
});

router.delete('/', async (req, res) => {
  const wid = req.body.wid;
  const userId = req.userId;

  try {
    const newList = await db.transaction().execute(async (trx) => {
      await trx.deleteFrom('workbooks')
      .where('wid', '=', wid)
      .execute();

      return await trx
      .selectFrom('workbooks')
      .select([ 'name', 'id', 'creator_id' ])
      .where('creator_id', '=', userId)
      .execute();
    });

    res.status(200).send(newList);
  } catch(err) {
    console.error(err);
  }
});


module.exports = router;