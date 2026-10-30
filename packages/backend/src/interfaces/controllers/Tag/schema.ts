import { z } from "zod";
import { queryBoolean } from "@/http/parsers.js";

export const getTags = {
  query: z.object({ q: z.string().nullish(), all: queryBoolean.nullish() }),
};
