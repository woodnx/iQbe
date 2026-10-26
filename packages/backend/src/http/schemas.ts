import { z } from "zod";

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

export const getAnalysisRankingAllPeriod = {
  param: z.object({ period: z.string() }),
};
export const getAnalysisRankingPersonalPeriod = {
  param: z.object({ period: z.string() }),
};
export const getAnalysisStatusDatePeriod = {
  param: z.object({ date: z.string(), period: z.string() }),
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
  param: z.object({ since: queryNumber, until: queryNumber }),
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
    judgement: z.number(),
    pressedWord: z.number(),
  }),
};
export const getQuizzes = {
  query: z.object({
    page: queryNumber.nullish(),
    maxView: queryNumber.pipe(z.number().min(0).max(100)).nullish(),
    seed: queryNumber.nullish(),
    wids: z.union([z.array(z.string()), z.string()]).nullish(),
    keyword: z.string().nullish(),
    keywordOption: queryNumber.nullish(),
    crctAnsRatio: z.array(queryNumber).nullish(),
    since: queryNumber.nullish(),
    until: queryNumber.nullish(),
    judgements: z.union([z.array(queryNumber), queryNumber]).nullish(),
    mid: z.string().nullish(),
    isFavorite: queryBoolean.nullish(),
    tags: z.union([z.array(z.string()), z.string()]).nullish(),
    tagMatchAll: queryBoolean.nullish(),
    categories: z.union([z.array(queryNumber), queryNumber]).nullish(),
  }),
};
export const postQuizzes = {
  json: z.object({
    question: z.string(),
    answer: z.string(),
    anotherAnswer: z.string().nullish(),
    tags: z.array(z.string()).nullish(),
    wid: z.string().nullish(),
    category: z.number().nullish(),
  }),
};
export const putQuizzesQid = {
  param: z.object({ qid: z.string() }),
  json: z.object({
    question: z.string(),
    anotherAnswer: z.string().nullish(),
    answer: z.string(),
    tags: z.array(z.string()).nullish(),
    wid: z.string().nullish(),
    category: z.number().nullish(),
  }),
};
export const deleteQuizzesQid = { param: z.object({ qid: z.string() }) };
export const getQuizzesSize = {
  query: z.object({
    wids: z.union([z.array(z.string()), z.string()]).nullish(),
    keyword: z.string().nullish(),
    keywordOption: queryNumber.nullish(),
    crctAnsRatio: z.array(queryNumber).nullish(),
    since: queryNumber.nullish(),
    until: queryNumber.nullish(),
    judgements: z.union([z.array(queryNumber), queryNumber]).nullish(),
    mid: z.string().nullish(),
    isFavorite: queryBoolean.nullish(),
    tags: z.union([z.array(z.string()), z.string()]).nullish(),
    tagMatchAll: queryBoolean.nullish(),
    categories: z.union([z.array(queryNumber), queryNumber]).nullish(),
  }),
};
export const postQuizzesMultiple = {
  json: z.object({
    records: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
          anotherAnswer: z.string().nullish(),
          tags: z.array(z.string()).nullish(),
          wid: z.string().nullish(),
          category: z.number().nullish(),
          subCategory: z.number().nullish(),
        }),
      )
      .nullish(),
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
  json: z.object({ quizId: z.number(), mid: z.string() }),
};
export const deleteMylistsQuiz = {
  json: z.object({ quizId: z.number(), mid: z.string() }),
};
export const getAnalysisRankingAllPeriodQuery = z.object({
  limit: queryNumber.optional(),
});
