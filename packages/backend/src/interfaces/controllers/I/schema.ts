import { z } from "zod";

export const getI = {};

export const putI = {
  json: z.object({ username: z.string(), nickname: z.string().nullish() }),
};

export const postIImage = {
  form: z.object({ file: z.instanceof(File).optional() }),
};
