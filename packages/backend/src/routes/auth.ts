import express from 'express';
import bcrypt from 'bcrypt';
import Sqids from 'sqids';
import knex from '../plugins/knex';
import dayjs from '../plugins/day';
import { generateAccessToken, generateRefreshToken } from '../plugins/jsonwebtoken';

const router = express.Router();

router.post('/login', async (req, res) => {
  const username: string | undefined = req.body.username;
  const password: string | undefined = req.body.password;
  const errorMes = 'No user with such a user name and password';

  if (!username || !password) {
    res.status(401).send('Undefined username or password');
    return;
  }

  try {
    const user = await knex('users').select('*').where({ 'username': username }).first();
    if (!user) {
      res.status(401).send(errorMes);
      return;
    }

    const crctPassword = bcrypt.compareSync(password, user.passwd);
    if (!crctPassword) {
      res.status(401).send(errorMes);
      return;
    }

    const userData = {
      uid: String(user.uid),
      username,
    };

    const accessToken = await generateAccessToken(userData);
    const refreshToken: string = await knex('refresh_tokens').select('token').where('user_id', user.id).first().token;
    return res.status(200).json({ accessToken, refreshToken });
  } catch(e) {
    res.status(401).json({ error: 'failed login' });
  }
});

router.post('/signin', async (req, res) => {
  const username: string | undefined = req.body.username;
  const password: string | undefined = req.body.password;
  const created = dayjs().format('YYYY-MM-DD HH:mm:ss');

  if (!username || !password) {
    res.status(401).send('Undefined username or password');
    return;
  }

  try {
    const totalUsers: number[] = await knex('users').select('id');
    const newUserIds = [ ...totalUsers, totalUsers.length + 1 ];
    const sqids = new Sqids({
      alphabet: process.env.SQIDS_SALT,
      minLength: 28,
    });

    const uid = sqids.encode(newUserIds);
    const passwd = bcrypt.hashSync(password, 10);

    knex.transaction(async (trx) => {
      await trx.insert({ uid, username, passwd, created }).into('users');
    });
    
    const userData = {
      uid,
      username,
    };

    const accessToken = await generateAccessToken(userData);
    const refreshToken = await generateRefreshToken(userData);
    return res.status(200).json({ accessToken, refreshToken });
  } catch(e) {
    res.status(401).send('invailed authentication');
  }
});

module.exports = router;