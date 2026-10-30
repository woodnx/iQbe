import { z } from "zod";
import { quizContentSchema } from "@/domains/Quiz/input.js";
import {
  dateTimestamp,
  positiveId,
  queryBoolean,
  queryNumber,
  validRange,
} from "@/http/parsers.js";

// Keep persisted numeric history values; expose named filters at the HTTP boundary.
const judgementNames = ["wrong", "right", "through", "unanswered"] as const;

const judgement = z
  .preprocess((value: unknown) => {
    if (typeof value === "number" && Number.isInteger(value))
      return judgementNames[value] ?? value;
    if (typeof value === "string" && /^[0-3]$/.test(value))
      return judgementNames[Number(value)];
    return value;
  }, z.enum(judgementNames))
  .transform((value) => judgementNames.indexOf(value)) as z.ZodType<
  number,
  (typeof judgementNames)[number]
>;

const filterShape = {
  history: queryBoolean.nullish(),
  wids: z
    .union([
      z.array(z.string().min(1).max(20)).max(100),
      z.string().min(1).max(20),
    ])
    .nullish(),
  keyword: z.string().max(2048).nullish(),
  keywordOption: queryNumber.pipe(z.number().int().min(1).max(3)).nullish(),
  crctAnsRatio: z
    .array(queryNumber.pipe(z.number().min(0).max(100)))
    .length(2)
    .refine(([min, max]) => min <= max)
    .nullish(),
  since: dateTimestamp.nullish(),
  until: dateTimestamp.nullish(),
  judgements: z.union([z.array(judgement).max(4), judgement]).nullish(),
  mid: z.string().min(1).max(20).nullish(),
  isFavorite: queryBoolean.nullish(),
  tags: z
    .union([
      z.array(z.string().min(1).max(128)).max(100),
      z.string().min(1).max(128),
    ])
    .nullish(),
  tagMatchAll: queryBoolean.nullish(),
  categories: z.union([z.array(positiveId).max(100), positiveId]).nullish(),
};

export const getQuizzes = {
  query: z
    .object({
      ...filterShape,
      page: positiveId.nullish().transform((value) => value ?? 1),
      maxView: positiveId
        .pipe(z.number().max(100))
        .nullish()
        .transform((value) => value ?? 100),
      seed: queryNumber.pipe(z.number().int().safe()).nullish(),
    })
    .refine(validRange, "since must not be after until"),
};

export const postQuizzes = { json: quizContentSchema };

export const getQuizzesByIds = {
  query: z.strictObject({
    qids: z
      .union([
        z.string().min(1).max(64),
        z.array(z.string().min(1).max(64)).min(1).max(100),
      ])
      .transform((value) => (Array.isArray(value) ? value : [value])),
  }),
};

export const putQuizzesQid = {
  param: z.object({ qid: z.string().min(1).max(64) }),
  json: quizContentSchema,
};

export const deleteQuizzesQid = { param: putQuizzesQid.param };

export const getQuizzesSize = {
  query: z
    .object(filterShape)
    .refine(validRange, "since must not be after until"),
};

export const postQuizzesMultiple = {
  json: z.object({
    records: z
      .array(
        quizContentSchema.extend({
          subCategory: z.number().int().positive().nullish(),
        }),
      )
      .min(1)
      .max(1000),
  }),
};
