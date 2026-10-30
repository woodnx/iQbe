import { z } from "zod";

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
