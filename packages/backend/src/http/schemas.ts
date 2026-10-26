import { z } from "zod";
import { quizContentSchema } from "@/domains/Quiz/input.js";

// Accept the HTTP representation without treating the string "false" as truthy.
// RPC callers supply numbers; HTTP query strings are parsed at the boundary.
const queryNumber = z.preprocess(
  (value: unknown) =>
    typeof value === "string" &&
    /^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)
      ? Number(value)
      : value,
  z.number(),
) as z.ZodType<number, number>;
const queryBoolean = z.preprocess(
  (value: unknown) =>
    value === "true" ? true : value === "false" ? false : value,
  z.boolean(),
) as z.ZodType<boolean, boolean>;

const period = z.enum(["day", "week", "month"]);
const dateString = z.string().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) return false;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return false;
  // Reject normalized dates such as February 30, including offset timestamps.
  const calendar = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return calendar.toISOString().slice(0, 10) === value.slice(0, 10);
}, "Invalid date");
const positiveId = queryNumber.pipe(z.number().int().positive().safe());
const timestamp = queryNumber.pipe(
  z.number().int().min(-8640000000000000).max(8640000000000000),
);
// Keep persisted numeric history values; expose named filters at the HTTP boundary.
const judgementNames = ["wrong", "right", "through", "unanswered"] as const;
const judgement = z.preprocess(
  (value: unknown) => {
    if (typeof value === "number" && Number.isInteger(value))
      return judgementNames[value] ?? value;
    if (typeof value === "string" && /^[0-3]$/.test(value))
      return judgementNames[Number(value)];
    return value;
  },
  z.enum(judgementNames),
).transform((value) => judgementNames.indexOf(value)) as z.ZodType<
  number,
  (typeof judgementNames)[number]
>;

// Legacy millisecond timestamps remain readable for saved links and older clients.
const quizDate = z.preprocess(
  (value: unknown) => {
    const legacy = timestamp.safeParse(value);
    return legacy.success ? new Date(legacy.data).toISOString() : value;
  },
  z.union([z.iso.date(), z.iso.datetime({ offset: true })]),
).transform((value) => new Date(value).getTime()) as z.ZodType<number, string>;
const filterShape = {
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
  since: quizDate.nullish(),
  until: quizDate.nullish(),
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
const validRange = (value: { since?: number | null; until?: number | null }) =>
  value.since == null || value.until == null || value.since <= value.until;

export const getAnalysisRankingAllPeriod = {
  param: z.object({ period }),
};
export const getAnalysisRankingPersonalPeriod = {
  param: z.object({ period }),
};
export const getAnalysisStatusDatePeriod = {
  param: z.object({ date: dateString, period }),
};
export const postAuthLogin = {
  json: z.object({ username: z.string(), password: z.string() }),
};
export const postAuthSignup = {
  json: z.object({
    username: z.string(),
    password: z.string(),
    email: z.string().nullish(),
    inviteCode: z.string().nullish(),
  }),
};
export const postAuthToken = {
  json: z.object({ refreshToken: z.string(), uid: z.string() }),
};
export const postAuthRegister = {
  json: z.object({
    username: z.string(),
    password: z.string(),
    email: z.string(),
  }),
};
export const postAuthAvailable = {
  json: z.object({ username: z.string().nullish() }),
};
export const getCategories = {};
export const postCategories = {
  json: z.object({
    name: z.string(),
    description: z.string().nullish(),
    parentId: z.number().nullish(),
    disabled: z.boolean(),
  }),
};
export const getCategoriesId = { param: z.object({ id: queryNumber }) };
export const putCategoriesId = {
  param: z.object({ id: queryNumber }),
  json: z.object({
    name: z.string(),
    description: z.string().nullish(),
    disabled: z.boolean(),
  }),
};
export const deleteCategoriesId = { param: z.object({ id: queryNumber }) };
export const getCategoriesPreset = {};
export const postCategoriesPreset = { json: z.object({ preset: z.string() }) };
export const postCsvParse = {
  form: z.object({ file: z.instanceof(File).optional() }),
};
export const getHistoriesSinceUntil = {
  param: z
    .object({ since: quizDate, until: quizDate })
    .refine(validRange, "since must not be after until"),
};
export const getHistories = {};
export const getI = {};
export const putI = {
  json: z.object({ username: z.string(), nickname: z.string().nullish() }),
};
export const postIImage = {
  form: z.object({ file: z.instanceof(File).optional() }),
};
export const getInviteCode = {
  query: z.object({
    status: queryNumber.nullish(),
    sort: z.string().nullish(),
  }),
};
export const postInviteCode = {};
export const getLevels = {};
export const postLike = { json: z.object({ qid: z.string() }) };
export const postUnlike = { json: z.object({ qid: z.string() }) };
export const getMylists = {};
export const postMylists = { json: z.object({ listName: z.string() }) };
export const putMylists = {
  json: z.object({ mid: z.string(), listName: z.string() }),
};
export const deleteMylists = { json: z.object({ mid: z.string() }) };
export const postPractice = {
  json: z.object({
    qid: z.string(),
    judgement: z.number().int().min(0).max(2),
    pressedWord: z.number().int().min(-1),
  }),
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
export const postRequestResetPassword = {
  json: z.object({ username: z.string(), email: z.string() }),
};
export const postResetPassword = {
  json: z.object({ token: z.string(), newPassword: z.string() }),
};
export const postRegister = {
  json: z.object({ qid: z.string(), mid: z.string() }),
};
export const postUnregister = {
  json: z.object({ qid: z.string(), mid: z.string() }),
};
export const getTags = {
  query: z.object({ q: z.string().nullish(), all: queryBoolean.nullish() }),
};
export const getWorkbooks = {};
export const postWorkbooks = {
  json: z.object({ name: z.string(), published: z.string().nullish() }),
};
export const getWorkbooksWid = { param: z.object({ wid: z.string() }) };
export const putWorkbooksWid = {
  param: z.object({ wid: z.string() }),
  json: z.object({ name: z.string(), published: z.string().nullish() }),
};
export const deleteWorkbooksWid = { param: z.object({ wid: z.string() }) };
export const getWorkbooksAll = {};
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
export const getAnalysisRankingAllPeriodQuery = z.object({
  limit: positiveId.pipe(z.number().max(100)).optional().default(5),
});
