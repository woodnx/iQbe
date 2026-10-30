import { z } from "zod";
import { queryNumber } from "@/http/parsers.js";

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
