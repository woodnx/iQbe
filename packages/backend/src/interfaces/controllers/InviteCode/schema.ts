import { z } from "zod";
import { queryNumber } from "@/http/parsers.js";

export const getInviteCode = {
  query: z.object({
    status: queryNumber.nullish(),
    sort: z.string().nullish(),
  }),
};

export const postInviteCode = {};
