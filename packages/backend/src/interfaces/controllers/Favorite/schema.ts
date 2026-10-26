import { z } from "zod";

export const postLike = { json: z.object({ qid: z.string() }) };

export const postUnlike = { json: z.object({ qid: z.string() }) };
