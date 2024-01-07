import express from 'express';
import { sql } from 'kysely';
import bcrypt from 'bcrypt';
import Hashids from 'hashids';
import { db } from '@/database';
import dayjs from '@/plugins/day';
import { generateAccessToken, generateRefreshToken } from '@/plugins/jsonwebtoken';

const router = express.Router();
const hashids = new Hashids(
  /* salt: */      process.env.HASHIDS_SALT,
  /* minLength: */ 28,
  /* alphabet: */  process.env.HASHIDS_ALPHABET,
);

router.post('/login', async (req, res) => {
  // ボディパラメータ
  const username: string | undefined = req.body.username;
  const password: string | undefined = req.body.password;

  const expDate = dayjs().add(1, 'year').toDate();
  const errorMes = 'No user with such a user name and password';

  // エラー処理
  if (!username) {
    res.status(401).send('Undefined username or password');
    return;
  }

  // DB接続
  try {
    await db.transaction().execute(async (trx) => {
      // usernameからUserを特定
      let user = await trx
      .selectFrom('users')
      .selectAll()
      .where('username', '=', username)
      .executeTakeFirst();
      
      // Userがいないときは，一旦再登録が必要かチェックする
      if (!user) {
        // emailカラムが存在すれば，再登録を促す
        const emailUser = await trx
        .selectFrom('users')
        .selectAll()
        .where('email', '=', username)
        .executeTakeFirstOrThrow();
  
        if (!!emailUser && !emailUser.passwd) {
          res.status(200).send('please do re-registration');
          return;
        } else if (!emailUser){
          res.status(401).send(errorMes);
          return;
        }
  
        user = emailUser;
      }

      if (!password) {
        res.status(401).send('Undefined username or password');
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
          'expired'
        ])
        .where('user_id', '=', user.id)
        .orderBy('id desc')
        .executeTakeFirst())?.token;
  
      const { id, passwd, ...sendUser } = user;
      res.status(200).json({ accessToken, refreshToken, user: sendUser });
    });
  } catch(e) {
    res.status(400).json({ error: 'failed login' });
  }
});

router.post('/signup', async (req, res) => {
  // ボディパラメータ
  const username: string | undefined = req.body.username;
  const email: string | undefined = req.body.email;
  const password: string | undefined = req.body.password;
  const requiredInviteCode: boolean = Boolean(req.body.requiredInviteCode);
  const code: string | undefined = req.body.inviteCode;
  const created = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const expDate = dayjs().add(1, 'year').toDate();

  if (!username || !password) {
    res.status(401).send('Undefined username or password');
    return;
  }

  try {
    // 内部userIdを求める
    const userIds = await db.selectFrom('users').select('id').orderBy('id desc').limit(1).execute();
    const lastUser = userIds.length !== 0 ? userIds[0].id : 0;
    const newUserId = [ ...Array(lastUser + 1).keys() ];

    const uid = hashids.encode(newUserId);
    const hashedPasswd = bcrypt.hashSync(password, 10);

    const userData = await db.transaction().execute(async (trx) => {
      // 招待コードの検証
      if (requiredInviteCode) {
        if (!code || !code.trim()) {
          res.status(400).send('Undefined invite code');
          return;
        }

        const inviteCode = await trx
        .selectFrom('invite_codes')
        .selectAll()
        .where('code', '=', code)
        .executeTakeFirstOrThrow();

        if (inviteCode.used) {
          res.status(400).send('Invalid invite code');
          return;
        }

        if (!inviteCode) {
          res.status(400).send('No invite code');
          return;
        }

        await trx
        .updateTable('invite_codes')
        .set({ used: 1 })
        .where('code', '=', code)
        .executeTakeFirstOrThrow();
      }

      await trx
      .insertInto('users')
      .values({
        uid,
        nickname: username,
        username,
        email,
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
  const refreshToken: string | undefined = req.body.refresh_token;
  const uid = req.body.id;

  if (!refreshToken) {
    res.status(401).send('no token');
    return;
  }

  try {
    const userId = (await db
    .selectFrom('users')
    .select('id')
    .where('uid', '=', uid)
    .executeTakeFirstOrThrow()
    ).id;

    // バイナリからエンコードする
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
      'expired'
    ])
    .where('user_id', '=', userId)
    .orderBy('id desc')
    .executeTakeFirst());
    
    if (!token) {
      res.status(400).send('no token')
      return;
    }

    if (token.expired) {
      res.status(400).send('token expired')
      return;
    }

    if (refreshToken.localeCompare(token.token, undefined, { sensitivity: 'base' }) || token.expired) {
      res.status(400).send('invalid token');
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

router.post('/reregister', async (req, res) => {
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
    const user = await db.selectFrom('users')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst();

    if (!user) {
      res.status(400).send('no such user');
      return;
    }
    
    const userId = user.id;
    const newUserId = [ ...Array(userId).keys() ];

    const uid = hashids.encode(newUserId);
    const passwd = bcrypt.hashSync(password, 10);

    const userData = await db.transaction().execute(async (trx) => {
      await trx
      .updateTable('users')
      .set({
        uid,
        username,
        passwd,
        modified: created,
      })
      .where('id', '=', userId)
      .executeTakeFirstOrThrow();
      
      const updatedUser = await trx
      .selectFrom('users')
      .select(['id', 'uid', 'username', 'email', 'created', 'modified', 'nickname'])
      .where('uid', '=', uid)
      .executeTakeFirstOrThrow();

      const genTokenUser = {
        uid: updatedUser.uid,
        username: updatedUser.username
      }
  
      const refreshToken = await generateRefreshToken(genTokenUser);
      const accessToken = await generateAccessToken(genTokenUser);

      await trx
      .insertInto('refresh_tokens')
      .values(() => { return { 
        user_id: userId,
        token: sql<Buffer>`UNHEX(REPLACE(${refreshToken}, '-', ''))`,
        expDate
      }})
      .executeTakeFirstOrThrow();

      return { accessToken, refreshToken, user: updatedUser };
    });
    
    return res.status(200).json(userData);
  } catch(e) {
    console.error(e);
  }
});

router.post('/available', async (req, res) => {
  const username = String(req.body.username);

  try {
    const user = await db
    .selectFrom('users')
    .select('uid')
    .where('username', '=', username)
    .executeTakeFirst();

    res.status(200).json({ available: !user });
  } catch(e) {
    console.error(e);
  }
});

module.exports = router;