import { toStudyDate } from "./day.js";

describe("toStudyDate", () => {
  it("日本時間 23:59:59 はその日の学習日になる", () => {
    expect(toStudyDate(new Date("2026-11-16T14:59:59Z"))).toBe("2026-11-16");
  });

  it("日本時間 0:00:00 は翌日の学習日になる", () => {
    expect(toStudyDate(new Date("2026-11-16T15:00:00Z"))).toBe("2026-11-17");
  });
});
