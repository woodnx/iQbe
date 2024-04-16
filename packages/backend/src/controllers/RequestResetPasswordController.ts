import { randomUUID } from "crypto";
import { db } from "@/database";
import { typedAsyncWrapper } from "@/utils";
import dayjs, { format } from "@/plugins/day";
import nodemailer from "@/plugins/nodemailer";
import { createError } from "@/plugins/createError";

export default {
  post: typedAsyncWrapper<"/request-reset-password", "post">(async (req, res, next) => {
    const email = req.body.email;
    const username = req.body.username;
    const expDate = format(dayjs().add(1, 'h').toDate());

    if (!username || !email) {
      next(createError.invalidParams());
    }

    db.transaction().execute(async (trx) => {
      const user = await trx
      .selectFrom('users')
      .selectAll()
      .where('username', '=', username)
      .executeTakeFirstOrThrow();

      if (email !== user.email) {
        next('no match your email');
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
      });
    });
  })
}