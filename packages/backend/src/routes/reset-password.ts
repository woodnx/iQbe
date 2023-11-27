import express from 'express';
import dayjs from 'dayjs';
import bcrypt from 'bcrypt'
import { db } from '@/database';

const router = express.Router();

router.post('/', async (req, res) => {
  const token = String(req.body.token);
  const newPassword = String(req.body.newPassword);
  const userId = req.userId;
  const now = dayjs();

  if (!token) {
    res.status(400).send('no reqeset reset password token');
    return;
  }

  await db.transaction().execute(async trx => {
    const resetToken = await trx.selectFrom('password_reset_tokens')
    .selectAll()
    .where('token', '=', token)
    .executeTakeFirstOrThrow();
  
    if (now.isAfter(resetToken.expDate) || resetToken.used) {
      res.status(400).send('token expired');
      return;
    }

    if (resetToken.user_id != userId) {
      res.status(400).send('different user');
      return;
    }

    const passwd = bcrypt.hashSync(newPassword, 10);
  
    await trx.updateTable('users')
    .set({
      passwd,
    })
    .where('id', '=', userId)
    .execute();

    await trx.updateTable('password_reset_tokens')
    .set({
      used: 1,
    }).execute();

    res.status(200).send('succeed reset password')
  });
});

module.exports = router;