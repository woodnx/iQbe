import { createTransport } from 'nodemailer'

const enableAuth = !!process.env.SMTP_USER
  && !!process.env.SMTP_PASS 
  && !!process.env.SMTP_USER.trim().length
  && !!process.env.SMTP_PASS.trim().length;

const mailer = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: enableAuth ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

export default mailer;