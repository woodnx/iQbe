import { z } from "zod";
import { dateTimestamp, validRange } from "@/http/parsers.js";

export const getHistoriesSinceUntil = {
  param: z
    .object({ since: dateTimestamp, until: dateTimestamp })
    .refine(validRange, "since must not be after until"),
};
