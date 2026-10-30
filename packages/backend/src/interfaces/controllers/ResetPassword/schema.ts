import { z } from "zod";

export const postRequestResetPassword = {
  json: z.object({ username: z.string(), email: z.string() }),
};

export const postResetPassword = {
  json: z.object({ token: z.string(), newPassword: z.string() }),
};
