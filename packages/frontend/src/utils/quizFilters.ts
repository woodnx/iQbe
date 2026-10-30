import { z } from "zod";

export const judgementSchema = z.enum([
  "wrong",
  "right",
  "through",
  "unanswered",
]);
export type Judgement = z.infer<typeof judgementSchema>;
const legacyJudgements = ["wrong", "right", "through", "unanswered"] as const;

// Normalize saved numeric search parameters once, before they enter UI state.
const savedJudgement = z.preprocess((value) => {
  if (typeof value === "number" && Number.isInteger(value))
    return legacyJudgements[value] ?? value;

  if (typeof value === "string" && /^[0-3]$/.test(value))
    return legacyJudgements[Number(value)];

  return value;
}, judgementSchema);

export const savedJudgements = z.preprocess(
  (value) => (value == null || Array.isArray(value) ? value : [value]),
  z.array(savedJudgement).max(4).nullish(),
);

export const savedQuizDate = z.preprocess(
  (value) => {
    const timestamp =
      typeof value === "number"
        ? value
        : typeof value === "string" && /^-?\d+$/.test(value)
          ? Number(value)
          : undefined;
    if (timestamp === undefined) return value;

    const date = new Date(timestamp);

    return Number.isFinite(date.getTime()) ? date.toISOString() : value;
  },
  z.union([z.iso.date(), z.iso.datetime({ offset: true })]).nullish(),
);
