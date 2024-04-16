import dayjs from "dayjs";
import { generateHashedPassword, typedAsyncWrapper } from "@/utils";
import { db } from "@/database";
import { createError } from "@/plugins/createError";

export default {
  post: typedAsyncWrapper<"/reset-password", "post">(async (req, res, next) => {
    const token = req.body.token;
    const newPassword = req.body.newPassword;
    const userId = req.userId;
    const now = dayjs();

    if (!token || !newPassword) {
      next(createError.invalidParams());
      return;
    }

    await db.transaction().execute(async trx => {
      const resetToken = await trx.selectFrom('password_reset_tokens')
      .selectAll()
      .where('token', '=', token)
      .executeTakeFirstOrThrow();
    
      if (now.isAfter(resetToken.expDate) || resetToken.used) {
        next(createError.expiredToken());
        return;
      }
  
      if (resetToken.user_id != userId) {
        next(createError.create({
          title: 'INVALID_USER',
          detail: 'The user shown is different from the user who requested the password reset',
          type: 'about:blank',
          status: 400,
        }));
        return;
      }
  
      const passwd = generateHashedPassword(newPassword);
    
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
    });

    res.status(200).send('succeed reset password');
  }),
}