import { z } from "zod";

export const postRegister = {
  json: z.object({ qid: z.string(), mid: z.string() }),
};

export const postUnregister = {
  json: z.object({ qid: z.string(), mid: z.string() }),
};
