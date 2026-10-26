import { z } from "zod";

export const getMylists = {};

export const postMylists = { json: z.object({ listName: z.string() }) };

export const putMylists = {
  json: z.object({ mid: z.string(), listName: z.string() }),
};

export const deleteMylists = { json: z.object({ mid: z.string() }) };

export const putMylistsQuiz = {
  json: z.object({
    quizId: z.number().int().positive().safe(),
    mid: z.string().min(1).max(20),
  }),
};

export const deleteMylistsQuiz = {
  json: z.object({
    quizId: z.number().int().positive().safe(),
    mid: z.string().min(1).max(20),
  }),
};
