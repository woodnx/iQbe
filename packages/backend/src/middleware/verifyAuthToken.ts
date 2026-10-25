import { ApiError } from "api";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { db } from "@/database.js";
import { createError } from "@/plugins/createError.js";
import { verifyAccessToken } from "@/plugins/jsonwebtoken.js";

// ユーザ認証ミドルウェア
export default async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // パスしたIDトークンを取得
  const idToken = req.headers.authorization;

  if (!idToken) {
    return next(createError.noToken());
  }

  try {
    // idTokenを検証
    const { uid, exp, iat } = await verifyAccessToken(idToken);

    const user = await db
      .selectFrom("users")
      .select(["id as userId", "uid", "username", "permission"])
      .where("uid", "=", uid)
      .executeTakeFirstOrThrow();

    req.user = {
      ...user,
      exp,
      iat,
      isSuperUser: user.permission == "SUPER_USER",
    };

    next();
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      next(new ApiError().expiredToken());
    } else if (e instanceof jwt.JsonWebTokenError) {
      next(new ApiError().invalidToken());
    }
  }
}
