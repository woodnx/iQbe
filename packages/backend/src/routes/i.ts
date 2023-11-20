import express from 'express';
import { db } from '@/database';

const router = express.Router();

router.get('/', async (req, res) => {
  const uid = String(req.query.id) || "";
  const errorMes = 'No user with such a user name and password';

  if (!uid) {
    res.status(401).send('no uid');
    return;
  }

  try {
    const { id, passwd, ...user } = await db
    .selectFrom('users')
    .selectAll()
    .where('uid', '=', uid)
    .executeTakeFirstOrThrow();

    if (!user) {
      res.status(401).send(errorMes);
      return;
    }

    return res.status(200).json(user);
  } catch(e) {
    res.status(400).json({ error: 'failed login' });
  }
});



module.exports = router;