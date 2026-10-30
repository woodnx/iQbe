import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";
import { db } from "@/database.js";
import { ApiError } from "@/http/ApiError.js";
import type { AppEnv } from "@/http/context.js";
import { verifyAccessToken } from "@/plugins/jsonwebtoken.js";

export default createMiddleware<AppEnv>(async (c, next) => {
  const token = c.req.header("authorization");
  if (!token) throw new ApiError().noToken();
  try {
    const { uid, exp, iat } = await verifyAccessToken(token);
    const user = await db
      .selectFrom("users")
      .select(["id as userId", "uid", "username", "permission"])
      .where("uid", "=", uid)
      .executeTakeFirst();
    if (!user) throw new ApiError().invalidToken();
    c.set("user", {
      ...user,
      exp,
      iat,
      isSuperUser: user.permission === "SUPER_USER",
    });
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) throw new ApiError().expiredToken();
    if (e instanceof jwt.JsonWebTokenError) throw new ApiError().invalidToken();
    throw e;
  }
  await next();
});
