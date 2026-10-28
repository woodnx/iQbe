import { z } from "zod";

export const postAuthLogin = {
  json: z.object({
    username: z.string().min(1).max(255),
    password: z.string().min(1).max(1024),
  }),
};

export const postAuthSignup = {
  json: z.object({
    username: z.string().min(1).max(255),
    password: z.string().min(1).max(1024),
    email: z.string().max(255).nullish(),
    inviteCode: z.string().max(255).nullish(),
  }),
};

export const postAuthToken = {
  json: z.object({ refreshToken: z.string(), uid: z.string() }),
};

export const postAuthRegister = {
  json: z.object({
    username: z.string().min(1).max(255),
    password: z.string().min(1).max(1024),
    email: z.string().max(255),
  }),
};

export const postAuthLogout = {
  json: z.object({ uid: z.string().min(1).max(255), refreshToken: z.uuid() }),
};

export const postAuthAvailable = {
  json: z.object({ username: z.string().min(1).max(255).nullish() }),
};
