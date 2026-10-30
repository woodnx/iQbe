import { z } from "zod";

export const quizContentSchema = z.object({
  question: z
    .string()
    .min(1)
    .max(2048)
    .refine((s) => s.trim().length > 0),
  answer: z
    .string()
    .min(1)
    .max(256)
    .refine((s) => s.trim().length > 0),
  anotherAnswer: z.string().max(256).nullish(),
  tags: z.array(z.string().min(1).max(128)).max(100).nullish(),
  wid: z.string().min(1).max(20).nullish(),
  category: z.number().int().positive().nullish(),
});
