import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || "";

// ユーザ認証ミドルウェア
export default async function (req: Request, res: Response, next: NextFunction) {
  // パスしたIDトークンを取得
  const idToken = req.headers.authorization;

  if (!idToken) { 
    res.status(401).send({ 'message': 'No authorization found' });
    return;
  }

  try {
    const bearer = idToken.split(" ");
    const token = bearer[1];

    // idTokenを検証
    jwt.verify(token, jwtSecret, (error, _user) => {
      if (error) {
        res.status(401).send('invalid authorization');
        return;
      }

      if (!_user) {
        res.status(401).send('No such user');
        return;
      }

      const user = JSON.parse(String(_user));
      req.userId = user.uid
    });

    next();
  } catch(e) {
    console.error(e);
    res.status(401).send({ 'message': 'invalid authorization' });
    return;
  }
}