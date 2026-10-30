import { describe, expect, it } from "vitest";
import { quizSearchSchema } from "@/routes/_schemas/quizSearch";
import { convertDates } from "./convertDates";

describe("quiz search state", () => {
  it("normalizes legacy dates and all four judgements before use by components", () => {
    expect(
      quizSearchSchema.parse({
        since: 0,
        until: "1",
        judgements: [0, 1, 2, 3],
      }),
    ).toMatchObject({
      since: "1970-01-01T00:00:00.000Z",
      until: "1970-01-01T00:00:00.001Z",
      judgements: ["wrong", "right", "through", "unanswered"],
    });
  });
  it("accepts named scalar and repeated filters and preserves ISO strings", () => {
    expect(
      quizSearchSchema.parse({ since: "2026-10-26", judgements: "unanswered" }),
    ).toMatchObject({ since: "2026-10-26", judgements: ["unanswered"] });
    expect(
      quizSearchSchema.parse({ judgements: ["wrong", "through"] }).judgements,
    ).toEqual(["wrong", "through"]);
  });
  it("rejects invalid dates and unknown judgements", () => {
    for (const input of [
      { since: "2026-02-30" },
      { judgements: [4] },
      { judgements: ["unknown"] },
    ])
      expect(quizSearchSchema.safeParse(input).success).toBe(false);
  });
  it("returns ISO strings with inclusive local day boundaries from the date picker", () => {
    const start = new Date(2026, 9, 25);
    const end = new Date(2026, 9, 26);
    const result = convertDates([start, end]);
    expect(result).toEqual([
      new Date(2026, 9, 25, 0, 0, 0, 0).toISOString(),
      new Date(2026, 9, 26, 23, 59, 59, 999).toISOString(),
    ]);
    expect(convertDates([start, null])[1]).toBe(
      new Date(2026, 9, 25, 23, 59, 59, 999).toISOString(),
    );
  });
});
