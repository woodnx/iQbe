import History, { placeOnStudyDays, type PracticeMode } from "./index.js";

const practicedAt = new Date("2026-11-16T03:00:00Z");
const attemptId = "c382ab80-f895-42a7-9c36-1bba967ef26f";

const history = (
  overrides: Partial<{
    qid: string;
    judgement: number;
    pressedWord: number;
    mode: PracticeMode | null;
  }> = {},
) =>
  new History(
    overrides.qid ?? "q1",
    "owner",
    overrides.pressedWord ?? 10,
    overrides.judgement ?? 1,
    practicedAt,
    attemptId,
    null,
    overrides.mode === undefined ? "FREE" : overrides.mode,
  );

describe("History.hasSameAnswer", () => {
  it("問題・判定・押し位置・モードが同じなら真", () => {
    expect(history().hasSameAnswer(history())).toBe(true);
  });

  it.each([
    ["問題", { qid: "q2" }],
    ["判定", { judgement: 0 }],
    ["押し位置", { pressedWord: 11 }],
  ] as const)("%s が違えば偽", (_, overrides) => {
    expect(history().hasSameAnswer(history(overrides))).toBe(false);
  });

  it("モードが両方分かっていて違えば偽", () => {
    expect(history().hasSameAnswer(history({ mode: "DAILY_SET" }))).toBe(false);
  });

  it("片方のモードが null（FSRS 接続前の履歴）なら、他が同じとき真", () => {
    expect(history({ mode: null }).hasSameAnswer(history())).toBe(true);
    expect(history().hasSameAnswer(history({ mode: null }))).toBe(true);
  });
});

describe("placeOnStudyDays", () => {
  it("日本時間の暦日ごとに 1 から番号を振り、日付が変われば 1 に戻る", () => {
    expect(
      placeOnStudyDays([
        new Date("2026-11-16T03:00:00Z"),
        new Date("2026-11-16T03:01:00Z"),
        new Date("2026-11-17T03:00:00Z"),
      ]),
    ).toEqual([
      { studyDate: "2026-11-16", dailyAttemptNumber: 1 },
      { studyDate: "2026-11-16", dailyAttemptNumber: 2 },
      { studyDate: "2026-11-17", dailyAttemptNumber: 1 },
    ]);
  });

  it("日の区切りは日本時間の 0 時で、UTC の 0 時ではない", () => {
    expect(
      placeOnStudyDays([
        // 日本時間 11/16 23:59:59
        new Date("2026-11-16T14:59:59Z"),
        // 日本時間 11/17 00:00:00
        new Date("2026-11-16T15:00:00Z"),
        // 日本時間 11/17 08:59:59（UTC ではまだ 11/16）
        new Date("2026-11-16T23:59:59Z"),
      ]),
    ).toEqual([
      { studyDate: "2026-11-16", dailyAttemptNumber: 1 },
      { studyDate: "2026-11-17", dailyAttemptNumber: 1 },
      { studyDate: "2026-11-17", dailyAttemptNumber: 2 },
    ]);
  });

  it("同じ時刻の解答も、渡した順に別の番号になる", () => {
    expect(placeOnStudyDays([practicedAt, practicedAt])).toEqual([
      { studyDate: "2026-11-16", dailyAttemptNumber: 1 },
      { studyDate: "2026-11-16", dailyAttemptNumber: 2 },
    ]);
  });

  it("解答が無ければ空になる", () => {
    expect(placeOnStudyDays([])).toEqual([]);
  });
});
