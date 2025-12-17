import { z } from "zod";

export const quizSearchSchema = z.object({
  page: z.number().optional(),
  maxView: z.number().nullable().optional(),
  seed: z
    .number()
    .nullable()
    .optional()
    .transform((v) => (Number.isNaN(v) ? undefined : v)),
  wids: z
    .union([z.string(), z.array(z.string())])
    .nullable()
    .optional(),
  keyword: z.string().nullable().optional(),
  keywordOption: z
    .number()
    .nullable()
    .optional()
    .transform((v) => (Number.isNaN(v) ? undefined : v)),
  crctAnsRatio: z.array(z.number()).nullable().optional(),
  since: z.number().nullable().optional(),
  until: z.number().nullable().optional(),
  judgements: z
    .union([z.number(), z.array(z.number())])
    .nullable()
    .optional(),
  mid: z.string().nullable().optional(),
  isFavorite: z
    .boolean()
    .nullable()
    .optional()
    .transform((v) => (v === undefined ? undefined : !!v)),
  tags: z
    .union([z.string(), z.array(z.string())])
    .nullable()
    .optional(),
  tagMatchAll: z
    .boolean()
    .nullable()
    .optional()
    .transform((v) => !!v),
  categories: z
    .union([z.number(), z.array(z.number())])
    .nullable()
    .optional(),
});

export type QuizSearch = z.infer<typeof quizSearchSchema>;
