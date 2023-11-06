import express, { Router } from 'express';
import { writeFileSync } from 'fs';
import path from 'path';
import dayjs from '../day';
import { db } from '../database';

const router: Router = express.Router();

router.put('/login', async (req, res) => {
  try {
    const uid = req.user.uid;
    const authTime = req.user.auth_time;

    const created = dayjs(authTime * 1000).format('YYYY-MM-DD HH:mm:ss');
    const modified = dayjs().format('YYYY-MM-DD HH:mm:ss');

    await db.transaction().execute(async trx => {
      const user = await trx
      .selectFrom('users')
      .selectAll()
      .where("uid", '=', uid)
      .executeTakeFirst();

      if (!!user) {
        const photo_url = `/photo/${user.id}`;
        const data = {...user, photo_url};

        const updates = await trx
        .updateTable('users')
        .set({ modified })
        .where("uid", '=', uid)
        .execute();

        res.send(data);
        console.log(`${updates.length} new users updated`);
      }
      else {
        const inserts = await trx
        .insertInto('users')
        .values({uid, modified, created})
        .execute();

        const user = await trx
        .selectFrom('users')
        .selectAll()
        .where("uid", '=', uid)
        .executeTakeFirst();

        res.send(user);
        console.log(`${inserts.length} new users saved`);
      }
    })
  } catch(e) {
    console.error(e);
  }
});

router.post('/signup', async (req, res) => {
  const uid = req.user.uid;
  const nickname = req.body.nickname;

  if (!nickname) {
    res.status(401).send('undefined nickname');
    return;
  }

  try {
    await db.transaction().execute(async trx => {
      const updates = await trx
      .updateTable('users')
      .set({ nickname })
      .where("uid", '=',uid)
      .execute();

      const user = await trx
      .selectFrom('users')
      .selectAll()
      .where("uid", '=', uid)
      .executeTakeFirst();

      res.send(user);
      console.log(`${updates.length} new users updated`);
    })
  } catch(e) {
    console.error(e);
  }
});

router.put('/rename', async (req, res) => {
  const uid = req.user.uid;
  const newName = req.body.newName;

  if (!newName) {
    res.status(401).send('undefined nickname');
    return;
  }

  try {
    await db.transaction().execute(async trx => {
      const updates = await trx
      .updateTable('users')
      .set({ nickname: newName })
      .where("uid", '=', uid)
      .execute();

      const user = await trx
      .selectFrom('users')
      .selectAll()
      .where("uid", '=', uid)
      .executeTakeFirst();

      res.send(user);
      console.log(`${updates} new users updated`);
    })
  } catch(e) {
    console.error(e);
  }
});

router.put('/photo', async (req, res) => {
  const uid = req.user.uid;
  const image = req.body.image;

  if (!image) {
    res.status(401).send('undefined image');
    return;
  }
  
  try {
    const userId = (await db
    .selectFrom('users')
    .select('id')
    .where("uid", '=', uid)
    .executeTakeFirst())
    ?.id;

    const imagepath = path.join(__dirname, 'public', String(userId));
    writeFileSync(imagepath, image.toString());
    
    res.send(imagepath);
    console.log(`1 new user updated`);
  }catch(err) {
    console.error(err);
  }
});

module.exports = router;