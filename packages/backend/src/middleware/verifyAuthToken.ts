import type { Request, Response, NextFunction } from 'express';
import { ApiError } from 'api';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { db } from '@/database';
import { createError } from '@/plugins/createError';
import { verifyAccessToken } from '@/plugins/jsonwebtoken';

// ユーザ認証ミドルウェア
export default async function (req: Request, res: Response, next: NextFunction) {
  // パスしたIDトークンを取得
  const idToken = req.headers.authorization;

  if (!idToken) { 
    return next(createError.noToken());;
  }

  try {
    // idTokenを検証
    const { uid, exp, iat } = await verifyAccessToken(idToken);

    const user = await db
    .selectFrom('users')
    .select([
      'id as userId',
      'uid',
      'username',
      'permission',
    ])
    .where('uid', '=', uid)
    .executeTakeFirstOrThrow();

    req.user = { ...user, exp, iat };

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