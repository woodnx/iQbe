import { MockTransactionManager } from "@/applications/shared/MockTransactionManager.js";
import History from "@/domains/History/index.js";
import Quiz from "@/domains/Quiz/index.js";
import UserQuizState from "@/domains/UserQuizState/index.js";
import { createReviewService } from "@/interfaces/factories/createReviewService.js";
import { InMemoryGrowthEventInfra } from "@/interfaces/infra/InMemory/GrowthEventInfra.js";
import { InMemoryHistoryInfra } from "@/interfaces/infra/InMemory/HistoryInfra.js";
import { InMemoryQuizInfra } from "@/interfaces/infra/InMemory/QuizInfra.js";
import { InMemoryUserQuizStateInfra } from "@/interfaces/infra/InMemory/UserQuizStateInfra.js";
import PracticeUseCase from "./PracticeUseCase.js";

/** quizzes.qid の utf8mb4_unicode_ci と同じく、大文字・小文字を区別せずに探す。 */
class CaseInsensitiveQuizInfra extends InMemoryQuizInfra {
  async findByQid(qid: string) {
    const found = Object.values(this.DB).find(
      (quiz) => quiz.qid.toLowerCase() === qid.toLowerCase(),
    );
    return found ?? null;
  }
}

const UID = "owner";
const ATTEMPT_1 = "c382ab80-f895-42a7-9c36-1bba967ef26f";
const ATTEMPT_2 = "5b1e4c55-1a5d-4a32-9a37-6a1c3f0e8b11";
const ATTEMPT_3 = "0d4b6f0e-2d3b-4f4a-8a52-9b8b1ea2c7d2";

// 日本時間 2026-11-16 12:00:00
const NOON_JST = new Date("2026-11-16T03:00:00.000Z");
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

function setUp() {
  const quizzes = new CaseInsensitiveQuizInfra();
  for (const qid of ["q1", "q2", "Ab"]) {
    quizzes.DB[qid] = Quiz.create(qid, "問題文", "答え", UID);
  }
  const histories = new InMemoryHistoryInfra();
  const states = new InMemoryUserQuizStateInfra();
  const growthEvents = new InMemoryGrowthEventInfra();
  const useCase = new PracticeUseCase(
    new MockTransactionManager(),
    quizzes,
    histories,
    states,
    growthEvents,
    createReviewService(),
  );
  return { useCase, quizzes, histories, states, growthEvents };
}

const setNow = (instant: Date) => vi.setSystemTime(instant);

describe("PracticeUseCase.addPractice", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    setNow(NOON_JST);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("初回の不正解は、直前の判定なし・イベントなし・当日 1 回目・学習中として確定する", async () => {
    const { useCase } = setUp();

    const result = await useCase.addPractice(UID, "q1", 0, 5, ATTEMPT_1);

    expect(result).toEqual({
      ok: true,
      data: {
        attemptId: "1",
        qid: "q1",
        judgement: 0,
        practicedAt: NOON_JST.toISOString(),
        outcome: {
          previousJudgement: null,
          review: {
            state: "LEARNING",
            nextReviewAt: new Date(NOON_JST.getTime() + MINUTE).toISOString(),
          },
          growthEvents: [],
          studyDate: "2026-11-16",
          dailyAttemptNumber: 1,
        },
      },
    });
  });

  it("不正解の 1 分後に正解すると、3 種類のイベントが成立し当日 2 回目になる", async () => {
    const { useCase } = setUp();
    await useCase.addPractice(UID, "q1", 0, 5, ATTEMPT_1);
    setNow(new Date(NOON_JST.getTime() + MINUTE));

    const result = await useCase.addPractice(UID, "q1", 1, 5, ATTEMPT_2);

    expect(result.ok && result.data.outcome).toMatchObject({
      previousJudgement: 0,
      growthEvents: ["FIRST_CORRECT", "REVENGE_SUCCESS", "REVIEW_SUCCESS"],
      dailyAttemptNumber: 2,
    });
  });

  it("同じ内容の再送は、日付が変わっても初回と同じ本文を返し、何も増やさない", async () => {
    const { useCase, histories, states, growthEvents } = setUp();
    const first = await useCase.addPractice(UID, "q1", 1, 5, ATTEMPT_1);

    const retried = await useCase.addPractice(UID, "q1", 1, 5, ATTEMPT_1);
    setNow(new Date(NOON_JST.getTime() + DAY));
    const retriedNextDay = await useCase.addPractice(
      UID,
      "q1",
      1,
      5,
      ATTEMPT_1,
    );

    expect(retried).toEqual(first);
    expect(retriedNextDay).toEqual(first);
    expect(histories.DB).toHaveLength(1);
    expect(growthEvents.DB.size).toBe(1);
    expect((await states.findByUidAndQid(UID, "q1"))?.reviewCount).toBe(1);
  });

  it.each([
    ["問題", "q2", 1, 5],
    ["判定", "q1", 0, 5],
    ["押し位置", "q1", 1, 6],
  ] as const)(
    "同じ clientAttemptId で %s を変えると競合になり、保存内容は変わらない",
    async (_, qid, judgement, pressedWord) => {
      const { useCase, histories, states } = setUp();
      await useCase.addPractice(UID, "q1", 1, 5, ATTEMPT_1);
      const savedHistories = [...histories.DB];
      const savedState = await states.findByUidAndQid(UID, "q1");

      const result = await useCase.addPractice(
        UID,
        qid,
        judgement,
        pressedWord,
        ATTEMPT_1,
      );

      expect(result).toMatchObject({
        ok: false,
        error: { code: "CLIENT_ATTEMPT_ID_CONFLICT" },
      });
      expect(histories.DB).toEqual(savedHistories);
      expect(await states.findByUidAndQid(UID, "q1")).toBe(savedState);
      expect(await states.findByUidAndQid(UID, "q2")).toBeNull();
    },
  );

  it("照合順序で同じ問題を指す qid は、保存値の qid にそろえて同じ解答として扱う", async () => {
    const { useCase } = setUp();

    const first = await useCase.addPractice(UID, "ab", 1, 5, ATTEMPT_1);
    const retried = await useCase.addPractice(UID, "ab", 1, 5, ATTEMPT_1);

    expect(first.ok && first.data.qid).toBe("Ab");
    expect(retried).toEqual(first);
  });

  it("同じ clientAttemptId の再送で、要求 qid が別の問題を指すと競合になる", async () => {
    const { useCase } = setUp();
    await useCase.addPractice(UID, "ab", 1, 5, ATTEMPT_1);

    const result = await useCase.addPractice(UID, "q1", 1, 5, ATTEMPT_1);

    expect(result).toMatchObject({
      ok: false,
      error: { code: "CLIENT_ATTEMPT_ID_CONFLICT" },
    });
  });

  it("存在しない問題は QUIZ_NOT_FOUND になり、何も保存されない", async () => {
    const { useCase, histories, states, growthEvents } = setUp();

    const result = await useCase.addPractice(UID, "missing", 1, 5, ATTEMPT_1);

    expect(result).toMatchObject({
      ok: false,
      error: { code: "QUIZ_NOT_FOUND" },
    });
    expect(histories.DB).toHaveLength(0);
    expect(states.DB.size).toBe(0);
    expect(growthEvents.DB.size).toBe(0);
  });

  it("新しい解答には設定の版 1 を記録し、応答には版を含めない", async () => {
    const { useCase, histories } = setUp();

    const result = await useCase.addPractice(UID, "q1", 1, 5, ATTEMPT_1);

    expect(histories.DB[0].reviewOutcome?.reviewSettingsVersion).toBe(1);
    expect(JSON.stringify(result)).not.toContain("ettingsVersion");
  });

  it("2^53 を超える履歴 ID も、応答と成長イベントへ正確に渡る", async () => {
    const { useCase, histories, growthEvents } = setUp();
    histories.nextId = 9007199254740993n;

    const result = await useCase.addPractice(UID, "q1", 1, 5, ATTEMPT_1);

    expect(result.ok && result.data.attemptId).toBe("9007199254740993");
    expect([...growthEvents.DB.values()].flat()[0].historyId).toBe(
      9007199254740993n,
    );
  });

  it("過去に正解した履歴（モード不明）がある問題を正解しても初正解にならず、状態は履歴から再生される", async () => {
    const { useCase, histories, states } = setUp();
    const yesterday = new Date(NOON_JST.getTime() - DAY);
    await histories.add(new History("q1", UID, 3, 0, yesterday, null));
    await histories.add(
      new History(
        "q1",
        UID,
        3,
        1,
        new Date(yesterday.getTime() + MINUTE),
        null,
      ),
    );

    const result = await useCase.addPractice(UID, "q1", 1, 5, ATTEMPT_1);

    expect(result.ok && result.data.outcome?.growthEvents).not.toContain(
      "FIRST_CORRECT",
    );
    expect((await states.findByUidAndQid(UID, "q1"))?.reviewCount).toBe(3);
  });

  it("押し位置の識別: 同日の 2 回目は 2、翌日の初回は 1 として記録される", async () => {
    const { useCase, histories } = setUp();

    await useCase.addPractice(UID, "q1", 0, 50, ATTEMPT_1);
    setNow(new Date(NOON_JST.getTime() + MINUTE));
    await useCase.addPractice(UID, "q1", 1, 20, ATTEMPT_2);
    setNow(new Date(NOON_JST.getTime() + DAY));
    await useCase.addPractice(UID, "q1", 1, 30, ATTEMPT_3);

    expect(
      histories.DB.map((history) => ({
        pressedWord: history.pressedWordPosition,
        ...history.studyDayPlacement,
      })),
    ).toEqual([
      { pressedWord: 50, studyDate: "2026-11-16", dailyAttemptNumber: 1 },
      { pressedWord: 20, studyDate: "2026-11-16", dailyAttemptNumber: 2 },
      { pressedWord: 30, studyDate: "2026-11-17", dailyAttemptNumber: 1 },
    ]);
  });

  it.each([0, -1])(
    "当日初回の正解の押し位置 %i は、そのまま保存される",
    async (pressedWord) => {
      const { useCase, histories } = setUp();

      await useCase.addPractice(UID, "q1", 1, pressedWord, ATTEMPT_1);

      expect(histories.DB[0].pressedWordPosition).toBe(pressedWord);
      expect(histories.DB[0].studyDayPlacement?.dailyAttemptNumber).toBe(1);
    },
  );

  it("FSRS 接続前の履歴と同じ内容の再送は、確定結果なし（outcome: null）で成功する", async () => {
    const { useCase, histories } = setUp();
    await histories.add(new History("q1", UID, 5, 1, NOON_JST, ATTEMPT_1));

    const result = await useCase.addPractice(UID, "q1", 1, 5, ATTEMPT_1);

    expect(result).toEqual({
      ok: true,
      data: {
        attemptId: "1",
        qid: "q1",
        judgement: 1,
        practicedAt: NOON_JST.toISOString(),
        outcome: null,
      },
    });
    expect(histories.DB).toHaveLength(1);
  });

  it("履歴が無いのに解答済みの状態があると、例外になり履歴を保存しない", async () => {
    const { useCase, histories, states } = setUp();
    const answered = createReviewService().scheduleReview(
      UserQuizState.create(UID, "q1"),
      1,
      NOON_JST,
    );
    await states.findOrCreateForUpdate(UID, "q1");
    await states.save(answered);

    await expect(
      useCase.addPractice(UID, "q1", 1, 5, ATTEMPT_1),
    ).rejects.toThrow();
    expect(histories.DB).toHaveLength(0);
  });
});
