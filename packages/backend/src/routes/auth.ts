import express from 'express';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Hashids from 'hashids';
import dayjs from '../plugins/day';
import { generateAccessToken, generateRefreshToken } from '../plugins/jsonwebtoken';
import { db } from '../database';
import { sql } from 'kysely';

const router = express.Router();
dotenv.config();
const hashids = new Hashids(
  /* salt: */      process.env.HASHIDS_SALT,
  /* minLength: */ 28,
  /* alphabet: */  process.env.HASHIDS_ALPHABET,
);

router.post('/login', async (req, res) => {
  const username: string | undefined = req.body.username;
  const password: string | undefined = req.body.password;
  const errorMes = 'No user with such a user name and password';

  if (!username || !password) {
    res.status(401).send('Undefined username or password');
    return;
  }

  try {
    const { id, ...user } = await db
    .selectFrom('users')
    .selectAll()
    .where('username', '=', username )
    .executeTakeFirstOrThrow();

    if (!user) {
      res.status(401).send(errorMes);
      return;
    }

    const crctPassword = bcrypt.compareSync(password, user.passwd);
    if (!crctPassword) {
      res.status(401).send(errorMes);
      return;
    }

    const genTokenUser = {
      uid: user.uid,
      username,
    };

    const accessToken = await generateAccessToken(genTokenUser);
    const refreshToken = (await db
    .selectFrom('refresh_tokens')
    .select(({ fn, val }) => [
      fn<string>('concat', [
        sql`SUBSTRING(HEX(token), 1, 8)`,
        val('-'),
        sql`SUBSTRING(HEX(token), 9, 4)`,
        val('-'),
        sql`SUBSTRING(HEX(token), 13, 4)`,
        val('-'),
        sql`SUBSTRING(HEX(token), 17, 4)`,
        val('-'),
        sql`SUBSTRING(HEX(token), 21, 12)`,
      ]).as('token'),
    ])
    .where('user_id', '=', id)
    .executeTakeFirst())?.token;

    if(!refreshToken) {
      res.status(400).send('no token');
      return;
    }

    return res.status(200).json({ accessToken, refreshToken, user });
  } catch(e) {
    res.status(400).json({ error: 'failed login' });
  }
});

router.post('/signup', async (req, res) => {
  const username: string | undefined = req.body.username;
  const password: string | undefined = req.body.password;
  const created = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const expDate = dayjs().add(1, 'year').toDate();

  if (!username || !password) {
    res.status(401).send('Undefined username or password');
    return;
  }

  try {
    const userIds = await db.selectFrom('users').select('id').execute();
    const lastUser = userIds[userIds.length - 1].id;
    const newUserId = [ ...Array(lastUser + 1).keys() ];

    const uid = hashids.encode(newUserId);
    const hashedPasswd = bcrypt.hashSync(password, 10);

    const userData = await db.transaction().execute(async (trx) => {
      await trx
      .insertInto('users')
      .values({
        uid,
        nickname: username,
        username,
        passwd: hashedPasswd,
        modified: created,
        created,
      })
      .executeTakeFirstOrThrow();

      const _user = await trx
      .selectFrom('users')
      .select(['id', 'uid', 'username', 'email', 'created', 'modified', 'nickname'])
      .where('uid', '=', uid)
      .executeTakeFirstOrThrow();

      const { id, ...user } = _user;

      const genTokenUser = {
        uid: user.uid,
        username: user.username
      };
  
      const refreshToken = await generateRefreshToken(genTokenUser);
      const accessToken = await generateAccessToken(genTokenUser);

      await trx
      .insertInto('refresh_tokens')
      .values({ 
        user_id: id,
        token: sql<Buffer>`UNHEX(REPLACE(${refreshToken}, '-', ''))`,
        expDate,
      })
      .execute();

      return { accessToken, refreshToken, user };
    });
    
    return res.status(200).json(userData);
  } catch(e) {
    console.error(e);
    res.status(401).send('Un error occured');
  }
});

router.post('/token', async (req, res) => {
  const refreshToken = req.body.refresh_token;
  const uid = req.body.id;

  if (!refreshToken) {
    res.status(401).send('invailed token');
    return;
  }

  try {
    const userId = (await db
    .selectFrom('users')
    .select('id')
    .where('uid', '=', uid)
    .executeTakeFirstOrThrow()
    ).id;

    const token = (await db
    .selectFrom('refresh_tokens')
    .select(({ fn, val }) => [
      fn<string>('concat', [
        sql`SUBSTRING(HEX(token), 1, 8)`,
        val('-'),
        sql`SUBSTRING(HEX(token), 9, 4)`,
        val('-'),
        sql`SUBSTRING(HEX(token), 13, 4)`,
        val('-'),
        sql`SUBSTRING(HEX(token), 17, 4)`,
        val('-'),
        sql`SUBSTRING(HEX(token), 21, 12)`,
      ]).as('token'),
    ])
    .where('user_id', '=', userId)
    .executeTakeFirstOrThrow()).token;
    
    if (token !== refreshToken) {
      res.status(400).send('invailed token');
      return;
    }

    const { id, passwd, ...user } = await db
    .selectFrom('users')
    .selectAll()
    .where('id', '=', userId)
    .executeTakeFirstOrThrow();

    const genTokenUser = {
      uid: !!user ? user.uid : '',
      username: !!user ? user.username : '',
    };

    const accessToken = await generateAccessToken(genTokenUser);

    res.status(200).send({ accessToken, user });
  } catch(e) {
    console.error(e)
  }
});

router.post('/old', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;
  const created = dayjs().toDate();
  const expDate = dayjs().add(1, 'year').toDate();

  if (!email) {
    res.status(400).send('no email');
    return;
  }
  
  try {
    const user = db.selectFrom('users')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst();

    if (!user) {
      res.status(400).send('no such user');
      return;
    }
    
    const userIds = await db.selectFrom('users').select('id').execute();
    const lastUser = userIds[userIds.length - 1].id;
    const newUserId = [ ...Array(lastUser + 1).keys() ];

    const uid = hashids.encode(newUserId);
    const passwd = bcrypt.hashSync(password, 10);

    const userData = await db.transaction().execute(async (trx) => {
      const { id, ...user } = await trx
      .insertInto('users')
      .values({
        uid,
        nickname: username,
        username,
        passwd,
        modified: created,
        created,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

      const genTokenUser = {
        uid: user.uid,
        username: user.username
      }
  
      const refreshToken = await generateRefreshToken(genTokenUser);
      const accessToken = await generateAccessToken(genTokenUser);

      await trx
      .insertInto('refresh_tokens')
      .values(() => { return { 
        user_id: id,
        token: sql<Buffer>`UNHEX(REPLACE(${refreshToken}, '-', ''))`,
        expDate
      }})
      .returning('token')
      .executeTakeFirstOrThrow();

      return { accessToken, refreshToken, user };
    });
    
    return res.status(200).json(userData);
  } catch(e) {

  }
});

module.exports = router;