import type { Context } from "hono";
import type { z } from "zod";

export type AuthUser = {
  userId: number;
  uid: string;
  username: string;
  permission: string;
  isSuperUser: boolean;
  iat: number;
  exp: number;
};
export type AppEnv = { Variables: { user: AuthUser } };
export type ApiContext<S extends Record<string, z.ZodType>> = Context<
  AppEnv,
  string,
  {
    in: { [K in keyof S]: z.input<S[K]> };
    out: { [K in keyof S]: z.output<S[K]> };
  }
>;
