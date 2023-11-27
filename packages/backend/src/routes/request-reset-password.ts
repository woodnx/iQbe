import express from 'express';
import { randomUUID } from 'crypto';
import { db } from '@/database';
import dayjs from '@/plugins/day';
import nodemailer from '@/plugins/nodemailer';

const router = express.Router();

router.post('/', async (req, res) => {
  const email = String(req.body.email);
  const username = String(req.body.username);
  const expDate = dayjs().add(1, 'h').toDate()

  try {
    db.transaction().execute(async (trx) => {
      const user = await trx
      .selectFrom('users')
      .selectAll()
      .where('username', '=', username)
      .executeTakeFirstOrThrow();
      
      if (email !== user.email) {
        res.status(400).send('no match your email')
        return;
      }
    
      const passwordResetToken = randomUUID();
      await trx.insertInto('password_reset_tokens')
      .values({
        user_id: user.id,
        token: passwordResetToken,
        expDate,
      }).execute();
      
      const resetUrl = `${process.env.URL}/reset-password?token=${passwordResetToken}`;
      await nodemailer.sendMail({
        from: process.env.MAIL_USER,
        to: user.email,
        subject: 'Password reset request',
        html: `
        <p>パスワードリセットをリクエストしました。以下のリンクをクリックしてパスワードをリセットしてください。<\p>
        <a href="${resetUrl}">${resetUrl}<\a>
        <p>このリクエストを行っていない場合は、このメールを無視してください。<\p>
        `,
      })
    });
  } catch(e) {
    console.error(e);
  }
});

module.exports = router;