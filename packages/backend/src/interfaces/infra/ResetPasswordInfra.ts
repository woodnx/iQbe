import ResetPassword from "@/domains/ResetPassword";
import IResetPasswordRepository from "@/domains/ResetPassword/ResetPasswordRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";
import nodemailer from "@/plugins/nodemailer";

export default class ResetPasswordInfra implements IResetPasswordRepository {
  constructor(
    private clientManager: KyselyClientManager,
  ) {}

  async findByToken(token: string): Promise<ResetPassword | null> {
    const client = this.clientManager.getClient();

    const resetPassword = await client.selectFrom('password_reset_tokens')
    .innerJoin('users', 'users.id', 'password_reset_tokens.user_id')
    .select([
      'expDate',
      'token',
      'used',
      'uid',
    ])
    .where('token', '=', token)
    .executeTakeFirst();

    if (!resetPassword) return null;

    return new ResetPassword(
      resetPassword.token,
      resetPassword.expDate,
      !!resetPassword.used,
      resetPassword.uid,
    )
  }

  async request(token: string, email: string): Promise<void> {
    const resetUrl = `${process.env.URL}/reset-password?token=${token}`;

    await nodemailer.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Password reset request',
      html: `
      <p>パスワードリセットをリクエストしました。以下のリンクをクリックしてパスワードをリセットしてください。<\p>
      <a href="${resetUrl}">${resetUrl}<\a>
      <p>このリクエストを行っていない場合は、このメールを無視してください。<\p>
      `,
    }, 
    // (err, res) => {
    //   console.log(err || res)
    // }
  );
  }

  async save(resetPassword: ResetPassword): Promise<void> {
    const client = this.clientManager.getClient();

    const userId = await client.selectFrom('users')
    .select('id')
    .where('uid', '=', resetPassword.requestedUid)
    .executeTakeFirstOrThrow()
    .then(user => user.id);

    await client.insertInto('password_reset_tokens')
    .values({
      token: resetPassword.token,
      expDate: resetPassword.exp,
      user_id: userId,
    })
    .execute();
  }
  
  async update(resetPassword: ResetPassword): Promise<void> {
    const client = this.clientManager.getClient();

    const userId = await client.selectFrom('users')
    .select('id')
    .where('uid', '=', resetPassword.requestedUid)
    .executeTakeFirstOrThrow()
    .then(user => user.id);

    await client.updateTable('password_reset_tokens')
    .set({
      token: resetPassword.token,
      expDate: resetPassword.exp,
      used: resetPassword.used ? 1 : 0,
      user_id: userId,
    })
    .execute();
  }
}