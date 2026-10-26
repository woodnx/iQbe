import { z } from "zod";

export const postPractice = {
  json: z.object({
    qid: z.string(),
    judgement: z.number().int().min(0).max(2),
    pressedWord: z.number().int().min(-1),
  }),
};
