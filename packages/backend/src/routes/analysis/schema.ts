import { z } from "zod";
import { positiveId } from "@/http/parsers.js";

const period = z.enum(["day", "week", "month"]);

const dateString = z.string().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) return false;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return false;
  // Reject normalized dates such as February 30, including offset timestamps.
  const calendar = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return calendar.toISOString().slice(0, 10) === value.slice(0, 10);
}, "Invalid date");

export const getAnalysisRankingAllPeriod = {
  param: z.object({ period }),
};

export const getAnalysisRankingPersonalPeriod = {
  param: z.object({ period }),
};

export const getAnalysisStatusDatePeriod = {
  param: z.object({ date: dateString, period }),
};

export const getAnalysisRankingAllPeriodQuery = z.object({
  limit: positiveId.pipe(z.number().max(100)).optional().default(5),
});
