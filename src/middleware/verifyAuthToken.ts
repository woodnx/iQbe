import type { Request, Response, NextFunction } from 'express';
import { auth } from 'firebase-admin';
import knex from '../knex';

// ユーザ認証ミドルウェア
export default async function (req: Request, res: Response, next: NextFunction) {
  // パスしたIDトークンを取得
  const idToken = req.headers.authorization;

  if (!idToken) { 
    res.status(401).send({ 'message': 'No authorization found' });
    return;
  }

  try {
    // idTokenを検証
    const decodedIdToken = await auth().verifyIdToken(idToken, true);
    req.user = decodedIdToken;

    const userId = await knex('users').select('id').where('uid', decodedIdToken.uid).first()

    req.userId = userId

    next();
  } catch(e) {
    console.error(e);
    res.status(401).send({ 'message': 'invalid authorization' });
    return;
  }
}