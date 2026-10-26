import { z } from "zod";

export const postAuthLogin = {
  json: z.object({ username: z.string(), password: z.string() }),
};

export const postAuthSignup = {
  json: z.object({
    username: z.string(),
    password: z.string(),
    email: z.string().nullish(),
    inviteCode: z.string().nullish(),
  }),
};

export const postAuthToken = {
  json: z.object({ refreshToken: z.string(), uid: z.string() }),
};

export const postAuthRegister = {
  json: z.object({
    username: z.string(),
    password: z.string(),
    email: z.string(),
  }),
};

export const postAuthAvailable = {
  json: z.object({ username: z.string().nullish() }),
};
