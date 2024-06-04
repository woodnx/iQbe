import type { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { verifyAccessToken } from '@/plugins/jsonwebtoken';
import { createError } from '@/plugins/createError';
import { db } from '@/database';
import ApiError from '@/domains/ApiError';

// ユーザ認証ミドルウェア
export default async function (req: Request, res: Response, next: NextFunction) {
  // パスしたIDトークンを取得
  const idToken = req.headers.authorization;

  if (!idToken) { 
    return next(createError.noToken());;
  }

  try {
    // idTokenを検証
    const decodedUser = await verifyAccessToken(idToken);

    const user = await db
    .selectFrom('users')
    .selectAll()
    .where('uid', '=', decodedUser.uid)
    .executeTakeFirstOrThrow();

    req.userId = user.id;
    req.uid = decodedUser.uid;

    next();
  } catch(e) {
    if (e instanceof TokenExpiredError) {
      next(new ApiError().expiredToken());
    }
    else if (e instanceof JsonWebTokenError) {
      next(new ApiError().invalidToken());
    }
  }
}