import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/plugins/jsonwebtoken';

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
    await verifyAccessToken(idToken);

    next();
  } catch(e) {
    console.error(e);
    res.status(401).send({ 'message': 'invalid authorization' });
    return;
  }
}