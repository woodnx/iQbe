import { z } from "zod";

export const QuerySchema = z.object({
  page: z.coerce.number().int().positive().nullable().optional(),
  maxView: z.coerce.number().int().positive().nullable().optional(),
  seed: z.coerce.number().nullable().optional(),

  wids: z
    .union([z.string(), z.array(z.string())])
    .nullable()
    .optional(),

  keyword: z.string().nullable().optional(),
  keywordOption: z.coerce.number().nullable().optional(),

  crctAnsRatio: z.preprocess(
    (v) => (typeof v === "string" ? v.split(",").map(Number) : v),
    z.array(z.number()).nullable().optional()
  ),

  since: z.coerce.number().nullable().optional(),
  until: z.coerce.number().nullable().optional(),

  judgements: z
    .union([z.coerce.number(), z.array(z.coerce.number())])
    .nullable()
    .optional(),

  mid: z.string().nullable().optional(),
  isFavorite: z.preprocess(
    (v) => (v === "true" ? true : v === "false" ? false : v),
    z.boolean().nullable().optional()
  ),

  tags: z
    .union([z.string(), z.array(z.string())])
    .nullable()
    .optional(),

  tagMatchAll: z.preprocess(
    (v) => (v === "true" ? true : v === "false" ? false : v),
    z.boolean().nullable().optional()
  ),

  categories: z
    .union([z.coerce.number(), z.array(z.coerce.number())])
    .optional(),
});
