import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { StartedMySqlContainer } from "@testcontainers/mysql";
import { createMiddleware } from "hono/factory";
import { sql } from "kysely";
import type { AppEnv } from "./http/context.js";

const integration =
  process.env.API_MYSQL_TESTS === "1" ? describe : describe.skip;

integration("MySQL API integration", () => {
  let container: StartedMySqlContainer;
  let db: typeof import("./database.js").db;
  let app: ReturnType<typeof import("./app.js").createApp>;
  let manager: InstanceType<
    typeof import("./interfaces/infra/kysely/KyselyClientManager.js").default
  >;
  let transactions: InstanceType<
    typeof import("./interfaces/infra/kysely/KyselyTransactionManager.js").default
  >;
  let quizzes: InstanceType<
    typeof import("./interfaces/infra/QuizInfra.js").default
  >;
  let bulk: InstanceType<
    typeof import("./applications/usecases/Quiz/AddQuizzesUseCase.js").AddQuizzesUseCase
  >;

  beforeAll(async () => {
    const { MySqlContainer } = await import("@testcontainers/mysql");
    container = await new MySqlContainer("mysql:9.1")
      .withDatabase("api_test")
      .start();
    process.env.DATABASE_URL = container.getConnectionUri(true);
    process.env.JWT_SECRET_KEY = "integration-test-secret";
    const schema = await readFile(
      new URL("../prisma/schema.prisma", import.meta.url),
      "utf8",
    );
    const dir = await mkdtemp(path.join(os.tmpdir(), "iqbe-schema-"));
    try {
      await writeFile(path.join(dir, "schema.prisma"), schema);
      execFileSync(
        process.execPath,
        [
          "node_modules/prisma/build/index.js",
          "db",
          "push",
          "--schema",
          path.join(dir, "schema.prisma"),
        ],
        { env: process.env, stdio: "pipe" },
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
    ({ db } = await import("./database.js"));
    const { default: Manager } =
      await import("./interfaces/infra/kysely/KyselyClientManager.js");
    const { default: Transactions } =
      await import("./interfaces/infra/kysely/KyselyTransactionManager.js");
    const { default: QuizInfra } =
      await import("./interfaces/infra/QuizInfra.js");
    const { default: CategoryInfra } =
      await import("./interfaces/infra/CategoryInfra.js");
    const { default: QuizBulkInfra } =
      await import("./interfaces/infra/QuizBulkInfra.js");
    const { AddQuizzesUseCase } =
      await import("./applications/usecases/Quiz/AddQuizzesUseCase.js");
    manager = new Manager();
    transactions = new Transactions(manager);
    quizzes = new QuizInfra(manager, new CategoryInfra(manager));
    bulk = new AddQuizzesUseCase(transactions, new QuizBulkInfra(manager));
    const { createApp } = await import("./app.js");
    app = createApp({
      webRoot: process.cwd(),
      publicRoot: process.cwd(),
      authenticate: createMiddleware<AppEnv>(async (c, next) => {
        c.set("user", {
          userId: 1,
          uid: "owner",
          username: "owner",
          permission: "USER",
          isSuperUser: false,
          iat: 0,
          exp: 9999999999,
        });
        await next();
      }),
    });
  }, 120000);

  afterEach(() => {
    vi.restoreAllMocks();
  });
  afterAll(async () => {
    if (db) await db.destroy();
    if (container) await container.stop();
  }, 30000);
  const t = (day: number) =>
    new Date(`2026-10-${String(day).padStart(2, "0")}T12:00:00Z`);
  beforeEach(async () => {
    for (const table of [
      "user_quiz_states",
      "tagging",
      "favorites",
      "histories",
      "mylists_quizzes",
      "quiz_visible_users",
      "quizzes",
      "workbooks",
      "mylists",
      "tags",
      "categories",
      "users",
    ] as const)
      await db.deleteFrom(table).execute();
    await db
      .insertInto("users")
      .values(
        [1, 2].map((id) => ({
          id,
          uid: id === 1 ? "owner" : "other",
          username: `user${id}`,
          passwd: "x",
          created: t(1),
          modified: t(1),
        })),
      )
      .execute();
    await db
      .insertInto("categories")
      .values([
        { id: 1, name: "root", parent_id: -1 },
        { id: 2, name: "child", parent_id: 1 },
      ])
      .execute();
    await db
      .insertInto("workbooks")
      .values([
        { id: 1, wid: "book", creator_id: 1, name: "book" },
        { id: 2, wid: "other-book", creator_id: 2, name: "other" },
      ])
      .execute();
    await db
      .insertInto("quizzes")
      .values(
        [1, 2, 3, 4].map((id) => ({
          id,
          qid: `q${id}`,
          creator_id: id === 4 ? 2 : 1,
          que: "question",
          ans: "answer",
          category_id: 2,
          workbook_id: 1,
          total_crct_ans: id === 3 ? 0 : 1,
          total_wrng_ans: id === 3 ? 0 : 1,
          total_through_ans: 0,
        })),
      )
      .execute();
    await db
      .insertInto("histories")
      .values([
        { user_id: 1, quiz_id: 1, practiced: t(20), judgement: 0 },
        { user_id: 1, quiz_id: 1, practiced: t(21), judgement: 1 },
        { user_id: 2, quiz_id: 1, practiced: t(22), judgement: 2 },
        { user_id: 1, quiz_id: 2, practiced: t(20), judgement: 1 },
        { user_id: 1, quiz_id: 2, practiced: t(22), judgement: 0 },
        { user_id: 2, quiz_id: 3, practiced: t(22), judgement: 1 },
      ])
      .execute();
    await db
      .insertInto("tags")
      .values([
        { id: 1, label: "a", created: t(1), modified: t(1) },
        { id: 2, label: "b", created: t(1), modified: t(1) },
      ])
      .execute();
    await db
      .insertInto("tagging")
      .values([
        { tag_id: 1, quiz_id: 1, registered: t(1) },
        { tag_id: 2, quiz_id: 1, registered: t(1) },
        { tag_id: 1, quiz_id: 2, registered: t(1) },
      ])
      .execute();
    await db
      .insertInto("favorites")
      .values(
        [1, 2].map((quiz_id) => ({ user_id: 1, quiz_id, registered: t(1) })),
      )
      .execute();
    await db
      .insertInto("mylists")
      .values([
        { id: 1, mid: "mine", user_id: 1, attr: 100, created: t(1) },
        { id: 2, mid: "theirs", user_id: 2, attr: 100, created: t(1) },
      ])
      .execute();
    await db
      .insertInto("mylists_quizzes")
      .values(
        [1, 2].map((quiz_id) => ({ mylist_id: 1, quiz_id, registered: t(1) })),
      )
      .execute();
  });

  const applyMigration = async (name: string) => {
    const migration = await readFile(
      new URL(`../prisma/migrations/${name}/migration.sql`, import.meta.url),
      "utf8",
    );
    // Comment lines may contain ";", so drop them before splitting statements.
    const statements = migration
      .replace(/^\s*--.*$/gm, "")
      .split(";")
      .filter((s) => s.trim());
    for (const statement of statements) {
      await sql.raw(statement).execute(db);
    }
  };

  describe("user quiz state schema", () => {
    const initialState = () => ({
      user_id: 1,
      quiz_id: 1,
      state: "LEARNING" as const,
      interval_days: 1,
      next_review_at: t(23),
      updated_at: t(22),
    });

    it("applies the migration without changing existing users, quizzes or histories", async () => {
      const before = await Promise.all([
        db.selectFrom("users").selectAll().orderBy("id").execute(),
        db.selectFrom("quizzes").selectAll().orderBy("id").execute(),
        db.selectFrom("histories").selectAll().orderBy("id").execute(),
      ]);
      // Only the new, empty table is removed from this disposable test database.
      await db.schema.dropTable("user_quiz_states").execute();
      await applyMigration("20261110000000_add_user_quiz_states");
      // Restore the later migrations so that the following tests use the current schema.
      await applyMigration("20261113000000_add_fsrs_memory");
      await applyMigration("20261124000000_allow_null_review_due");
      expect(
        await db.selectFrom("user_quiz_states").selectAll().execute(),
      ).toEqual([]);
      expect(
        await Promise.all([
          db.selectFrom("users").selectAll().orderBy("id").execute(),
          db.selectFrom("quizzes").selectAll().orderBy("id").execute(),
          db.selectFrom("histories").selectAll().orderBy("id").execute(),
        ]),
      ).toEqual(before);
    });

    it("stores one state per user and quiz, with zero counts and no previous review", async () => {
      await db.insertInto("user_quiz_states").values(initialState()).execute();
      await expect(
        db.insertInto("user_quiz_states").values(initialState()).execute(),
      ).rejects.toMatchObject({ code: "ER_DUP_ENTRY" });
      await db
        .insertInto("user_quiz_states")
        .values({
          ...initialState(),
          user_id: 2,
          state: "REVIEWING",
          review_count: 2,
          success_streak: 1,
          last_reviewed_at: t(22),
        })
        .execute();
      expect(
        await db
          .selectFrom("user_quiz_states")
          .selectAll()
          .orderBy("user_id")
          .execute(),
      ).toEqual([
        {
          ...initialState(),
          review_count: 0,
          success_streak: 0,
          last_reviewed_at: null,
          fsrs_memory: null,
        },
        {
          ...initialState(),
          user_id: 2,
          state: "REVIEWING",
          review_count: 2,
          success_streak: 1,
          last_reviewed_at: t(22),
          fsrs_memory: null,
        },
      ]);
    });

    it.each(["review_count", "success_streak", "interval_days"] as const)(
      "rejects negative %s",
      async (field) => {
        await expect(
          db
            .insertInto("user_quiz_states")
            .values({ ...initialState(), [field]: -1 })
            .execute(),
        ).rejects.toMatchObject({ code: "ER_WARN_DATA_OUT_OF_RANGE" });
      },
    );

    it.each(["user_id", "quiz_id"] as const)(
      "rejects a missing reference for %s",
      async (field) => {
        await expect(
          db
            .insertInto("user_quiz_states")
            .values({ ...initialState(), [field]: 999 })
            .execute(),
        ).rejects.toMatchObject({ code: "ER_NO_REFERENCED_ROW_2" });
      },
    );

    it("removes only the states related to a deleted user or quiz", async () => {
      await db
        .insertInto("users")
        .values({
          id: 3,
          uid: "state-only-user",
          created: t(1),
          modified: t(1),
        })
        .execute();
      await db
        .insertInto("user_quiz_states")
        .values([
          initialState(),
          { ...initialState(), user_id: 3 },
          { ...initialState(), quiz_id: 4, state: "RETAINED" },
        ])
        .execute();
      await db.deleteFrom("users").where("id", "=", 3).execute();
      await db.deleteFrom("quizzes").where("id", "=", 4).execute();
      expect(
        await db
          .selectFrom("user_quiz_states")
          .select(["user_id", "quiz_id"])
          .execute(),
      ).toEqual([{ user_id: 1, quiz_id: 1 }]);
    });
  });

  const postPractice = (body: {
    qid: string;
    judgement: number;
    pressedWord: number;
    clientAttemptId: string;
  }) =>
    app.request("/api/practice", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

  it("acknowledges sequential and concurrent retries without changing the saved answer", async () => {
    const body = {
      qid: "q1",
      judgement: 1,
      pressedWord: 0,
      clientAttemptId: randomUUID(),
    };
    const first = await postPractice(body);
    expect(first.status).toBe(200);
    const firstBody = await first.json();
    const saved = await db
      .selectFrom("histories")
      .selectAll()
      .where("client_attempt_id", "=", body.clientAttemptId)
      .executeTakeFirstOrThrow();
    expect(saved.pressed_word).toBe(0);
    expect(firstBody).toMatchObject({
      attemptId: String(saved.id),
      qid: "q1",
      judgement: 1,
      practicedAt: saved.practiced.toISOString(),
    });
    // A retry must retain the original timestamp, even long after the answer.
    await db
      .updateTable("histories")
      .set({ practiced: t(1) })
      .where("id", "=", saved.id)
      .execute();
    expect((await postPractice(body)).status).toBe(200);
    const responses = await Promise.all(
      Array.from({ length: 5 }, () => postPractice(body)),
    );
    expect(responses.map((r) => r.status)).toEqual([200, 200, 200, 200, 200]);
    expect(
      await db
        .selectFrom("histories")
        .selectAll()
        .where("client_attempt_id", "=", body.clientAttemptId)
        .execute(),
    ).toEqual([{ ...saved, practiced: t(1) }]);
  });

  it("inserts only one answer when the first submissions race", async () => {
    const body = {
      qid: "q1",
      judgement: 1,
      pressedWord: 0,
      clientAttemptId: randomUUID(),
    };
    const responses = await Promise.all(
      Array.from({ length: 5 }, () => postPractice(body)),
    );
    expect(responses.map((r) => r.status)).toEqual([200, 200, 200, 200, 200]);
    expect(
      await db
        .selectFrom("histories")
        .selectAll()
        .where("client_attempt_id", "=", body.clientAttemptId)
        .execute(),
    ).toHaveLength(1);
  });

  it.each([{ qid: "q2" }, { judgement: 0 }, { pressedWord: 1 }])(
    "rejects conflicting retries without modifying the saved answer: %j",
    async (change) => {
      const body = {
        qid: "q1",
        judgement: 1,
        pressedWord: 0,
        clientAttemptId: randomUUID(),
      };
      expect((await postPractice(body)).status).toBe(200);
      const saved = await db
        .selectFrom("histories")
        .selectAll()
        .where("client_attempt_id", "=", body.clientAttemptId)
        .execute();
      const response = await postPractice({ ...body, ...change });
      expect(response.status).toBe(409);
      expect(await response.json()).toMatchObject({
        code: "CLIENT_ATTEMPT_ID_CONFLICT",
      });
      expect(
        await db
          .selectFrom("histories")
          .selectAll()
          .where("client_attempt_id", "=", body.clientAttemptId)
          .execute(),
      ).toEqual(saved);
    },
  );

  it("accepts one of two conflicting concurrent answers and rejects the other", async () => {
    const body = {
      qid: "q1",
      judgement: 1,
      pressedWord: 0,
      clientAttemptId: randomUUID(),
    };
    const responses = await Promise.all([
      postPractice(body),
      postPractice({ ...body, judgement: 0 }),
    ]);
    expect(responses.map((r) => r.status).sort()).toEqual([200, 409]);
    const saved = await db
      .selectFrom("histories")
      .selectAll()
      .where("client_attempt_id", "=", body.clientAttemptId)
      .execute();
    expect(saved).toHaveLength(1);
    expect(saved[0].judgement).toBe(responses[0].status === 200 ? 1 : 0);
  });

  it("scopes attempt IDs and replay lookup to the authenticated user", async () => {
    const body = {
      qid: "q1",
      judgement: 1,
      pressedWord: 0,
      clientAttemptId: randomUUID(),
    };
    await db
      .insertInto("histories")
      .values({
        user_id: 2,
        quiz_id: 2,
        judgement: 0,
        pressed_word: 5,
        practiced: t(1),
        client_attempt_id: body.clientAttemptId,
      })
      .execute();
    expect((await postPractice(body)).status).toBe(200);
    expect((await postPractice(body)).status).toBe(200);
    const saved = await db
      .selectFrom("histories")
      .select(["user_id", "quiz_id", "judgement"])
      .where("client_attempt_id", "=", body.clientAttemptId)
      .orderBy("user_id")
      .execute();
    expect(saved).toEqual([
      { user_id: 1, quiz_id: 1, judgement: 1 },
      { user_id: 2, quiz_id: 2, judgement: 0 },
    ]);
  });

  it("saves distinct attempts in the same second and selects the last inserted answer", async () => {
    const body = {
      qid: "q1",
      judgement: 1,
      pressedWord: 0,
      clientAttemptId: randomUUID(),
    };
    const later = { ...body, judgement: 0, clientAttemptId: randomUUID() };
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-07T12:00:00Z"));
    try {
      expect((await postPractice(body)).status).toBe(200);
      expect((await postPractice(later)).status).toBe(200);
    } finally {
      vi.useRealTimers();
    }
    const saved = await db
      .selectFrom("histories")
      .selectAll()
      .where("client_attempt_id", "in", [
        body.clientAttemptId,
        later.clientAttemptId,
      ])
      .orderBy("id")
      .execute();
    expect(saved).toHaveLength(2);
    expect(saved[0].practiced).toEqual(saved[1].practiced);
    expect(saved.map((row) => row.judgement)).toEqual([1, 0]);
    expect(
      (await quizzes.findMany("owner")).find((q) => q.qid === "q1")?.judgement,
    ).toBe(0);
    const history = await quizzes.findMany("owner", { history: true });
    expect(history.slice(0, 2).map((q) => [q.qid, q.judgement])).toEqual([
      ["q1", 0],
      ["q1", 1],
    ]);
  });

  describe("practice learning records", () => {
    const CORRECT = 1;
    const WRONG = 0;
    const answer = (qid: string, judgement: number, pressedWord = 3) => ({
      qid,
      judgement,
      pressedWord,
      clientAttemptId: randomUUID(),
    });
    const ownerQuizId = async (qid: string) =>
      (
        await db
          .selectFrom("quizzes")
          .select("id")
          .where("qid", "=", qid)
          .executeTakeFirstOrThrow()
      ).id;
    const historiesOf = async (qid: string) =>
      db
        .selectFrom("histories")
        .select([
          "id",
          "client_attempt_id",
          "judgement",
          "pressed_word",
          "practice_mode",
          sql<string | null>`DATE_FORMAT(histories.study_date, '%Y-%m-%d')`.as(
            "study_date",
          ),
          "daily_attempt_number",
          "previous_judgement",
          "review_state",
          "review_settings_version",
        ])
        .where("user_id", "=", 1)
        .where("quiz_id", "=", await ownerQuizId(qid))
        .orderBy("id")
        .execute();
    const stateOf = async (qid: string) =>
      db
        .selectFrom("user_quiz_states")
        .selectAll()
        .where("user_id", "=", 1)
        .where("quiz_id", "=", await ownerQuizId(qid))
        .executeTakeFirst();
    const growthEventsOf = async (qid: string) =>
      db
        .selectFrom("growth_events")
        .select(["history_id", "type"])
        .where("user_id", "=", 1)
        .where("quiz_id", "=", await ownerQuizId(qid))
        .orderBy("history_id")
        .orderBy("type")
        .execute();
    const snapshotTables = async () =>
      Promise.all([
        db.selectFrom("histories").selectAll().orderBy("id").execute(),
        db
          .selectFrom("user_quiz_states")
          .selectAll()
          .orderBy("user_id")
          .orderBy("quiz_id")
          .execute(),
        db.selectFrom("growth_events").selectAll().orderBy("id").execute(),
      ]);
    const expectNoRowsOfQuiz = async (quizId: number) => {
      for (const table of [
        "histories",
        "user_quiz_states",
        "growth_events",
      ] as const)
        expect(
          await db
            .selectFrom(table)
            .select("quiz_id")
            .where("quiz_id", "=", quizId)
            .execute(),
        ).toEqual([]);
    };
    const deleteQuiz = (qid: string) =>
      db.deleteFrom("quizzes").where("qid", "=", qid).execute();
    const withFixedTime = async <T>(instant: Date, run: () => Promise<T>) => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(instant);
      try {
        return await run();
      } finally {
        vi.useRealTimers();
      }
    };

    it("records one answer, one review and one set of events for five concurrent identical submissions", async () => {
      const body = answer("q3", CORRECT);
      const responses = await Promise.all(
        Array.from({ length: 5 }, () => postPractice(body)),
      );
      expect(responses.map((r) => r.status)).toEqual([200, 200, 200, 200, 200]);
      const bodies = await Promise.all(responses.map((r) => r.json()));
      expect(new Set(bodies.map((b) => JSON.stringify(b))).size).toBe(1);
      expect(await historiesOf("q3")).toHaveLength(1);
      expect((await stateOf("q3"))?.review_count).toBe(1);
      expect((await growthEventsOf("q3")).map((e) => e.type)).toEqual([
        "FIRST_CORRECT",
      ]);
    });

    it("saves two distinct attempts in the same second in processing order", async () => {
      await withFixedTime(new Date("2026-11-16T03:00:00Z"), async () => {
        expect((await postPractice(answer("q3", WRONG))).status).toBe(200);
        expect((await postPractice(answer("q3", CORRECT))).status).toBe(200);
      });
      const saved = await historiesOf("q3");
      expect(saved.map((h) => h.daily_attempt_number)).toEqual([1, 2]);
      expect(saved.map((h) => h.previous_judgement)).toEqual([null, WRONG]);
      expect((await stateOf("q3"))?.review_count).toBe(2);
    });

    it("serializes ten concurrent first answers to the same quiz without deadlocks", async () => {
      const responses = await withFixedTime(
        new Date("2026-11-16T03:00:00Z"),
        () =>
          Promise.all(
            Array.from({ length: 10 }, () => postPractice(answer("q3", WRONG))),
          ),
      );
      expect(responses.map((r) => r.status)).toEqual(Array(10).fill(200));
      const numbers = (await historiesOf("q3")).map(
        (h) => h.daily_attempt_number,
      );
      expect([...numbers].sort((a, b) => Number(a) - Number(b))).toEqual(
        Array.from({ length: 10 }, (_, i) => i + 1),
      );
      expect((await stateOf("q3"))?.review_count).toBe(10);
    });

    it("leaves histories, states and growth events untouched on a 409 conflict", async () => {
      const body = answer("q3", CORRECT);
      expect((await postPractice(body)).status).toBe(200);
      const before = await snapshotTables();
      const response = await postPractice({ ...body, judgement: WRONG });
      expect(response.status).toBe(409);
      expect(await snapshotTables()).toEqual(before);
    });

    it("rolls back the history and the state when saving growth events fails, and a retry saves once", async () => {
      const { default: GrowthEventInfra } =
        await import("./interfaces/infra/GrowthEventInfra.js");
      vi.spyOn(GrowthEventInfra.prototype, "insertAll").mockRejectedValueOnce(
        new Error("growth events unavailable"),
      );
      const body = answer("q3", CORRECT);
      expect((await postPractice(body)).status).toBe(500);
      expect(await historiesOf("q3")).toEqual([]);
      expect(await stateOf("q3")).toBeUndefined();

      expect((await postPractice(body)).status).toBe(200);
      expect(await historiesOf("q3")).toHaveLength(1);
      expect((await stateOf("q3"))?.review_count).toBe(1);
      expect(await growthEventsOf("q3")).toHaveLength(1);
    });

    it("records all three growth events for a correct answer one minute after a wrong one, once", async () => {
      const correct = answer("q3", CORRECT);
      const second = await withFixedTime(
        new Date("2026-11-16T03:00:00Z"),
        async () => {
          await postPractice(answer("q3", WRONG));
          vi.setSystemTime(new Date("2026-11-16T03:01:00Z"));
          return postPractice(correct);
        },
      );
      expect(await second.json()).toMatchObject({
        outcome: {
          previousJudgement: WRONG,
          growthEvents: ["FIRST_CORRECT", "REVENGE_SUCCESS", "REVIEW_SUCCESS"],
          dailyAttemptNumber: 2,
        },
      });
      expect((await postPractice(correct)).status).toBe(200);
      expect((await growthEventsOf("q3")).map((e) => e.type)).toEqual([
        "FIRST_CORRECT",
        "REVENGE_SUCCESS",
        "REVIEW_SUCCESS",
      ]);
    });

    it("does not count a correct answer as first correct after a legacy correct answer, and replays legacy history", async () => {
      const response = await postPractice(answer("q1", CORRECT));
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.outcome.growthEvents).not.toContain("FIRST_CORRECT");
      expect(body.outcome.previousJudgement).toBe(CORRECT);
      expect((await stateOf("q1"))?.review_count).toBe(3);
    });

    it("removes growth events and histories with a deleted quiz and answers a retry with 404", async () => {
      const body = answer("q3", CORRECT);
      expect((await postPractice(body)).status).toBe(200);
      const quizId = await ownerQuizId("q3");
      await deleteQuiz("q3");
      expect(
        await db
          .selectFrom("growth_events")
          .select("id")
          .where("quiz_id", "=", quizId)
          .execute(),
      ).toEqual([]);
      expect(
        await db
          .selectFrom("histories")
          .select("id")
          .where("quiz_id", "=", quizId)
          .execute(),
      ).toEqual([]);
      const retry = await postPractice(body);
      expect(retry.status).toBe(404);
      expect(await retry.json()).toMatchObject({ code: "QUIZ_NOT_FOUND" });
    });

    it("splits study dates at midnight in Japan time", async () => {
      await withFixedTime(new Date("2026-11-16T14:59:59Z"), async () => {
        expect((await postPractice(answer("q3", WRONG))).status).toBe(200);
        vi.setSystemTime(new Date("2026-11-16T15:00:00Z"));
        expect((await postPractice(answer("q3", WRONG))).status).toBe(200);
      });
      expect(
        (await historiesOf("q3")).map((h) => [
          h.study_date,
          h.daily_attempt_number,
        ]),
      ).toEqual([
        ["2026-11-16", 1],
        ["2026-11-17", 1],
      ]);
    });

    it("applies the learning record migration without changing existing histories", async () => {
      const before = await db
        .selectFrom("histories")
        .selectAll()
        .orderBy("id")
        .execute();
      // Only this disposable database loses the objects that the migration adds.
      await db.schema.dropTable("growth_events").execute();
      await sql
        .raw(
          "DROP INDEX histories_user_id_quiz_id_study_date_daily_attempt_number_key ON histories",
        )
        .execute(db);
      await sql
        .raw(
          `ALTER TABLE histories DROP COLUMN daily_attempt_number, DROP COLUMN next_review_at,
            DROP COLUMN practice_mode, DROP COLUMN previous_judgement,
            DROP COLUMN review_settings_version, DROP COLUMN review_state, DROP COLUMN study_date`,
        )
        .execute(db);
      await applyMigration("20261116000000_add_practice_learning_records");
      expect(
        await db.selectFrom("histories").selectAll().orderBy("id").execute(),
      ).toEqual(before);
      expect(
        before.every(
          (row) =>
            row.practice_mode === null &&
            row.study_date === null &&
            row.daily_attempt_number === null &&
            row.previous_judgement === null &&
            row.review_state === null &&
            row.next_review_at === null &&
            row.review_settings_version === null,
        ),
      ).toBe(true);
      expect(
        await db.selectFrom("growth_events").selectAll().execute(),
      ).toEqual([]);
    });

    it("records settings version 1 for new answers and leaves legacy histories NULL", async () => {
      expect((await postPractice(answer("q1", CORRECT))).status).toBe(200);
      expect(
        (await historiesOf("q1")).map((h) => [
          h.practice_mode,
          h.review_settings_version,
        ]),
      ).toEqual([
        [null, null],
        [null, null],
        ["FREE", 1],
      ]);
    });

    it("answers 404 without saving when the quiz is deleted before the state lock", async () => {
      const { default: UserQuizStateInfra } =
        await import("./interfaces/infra/UserQuizStateInfra.js");
      const original = UserQuizStateInfra.prototype.findOrCreateForUpdate;
      vi.spyOn(
        UserQuizStateInfra.prototype,
        "findOrCreateForUpdate",
      ).mockImplementationOnce(async function (
        this: InstanceType<typeof UserQuizStateInfra>,
        ...args
      ) {
        await deleteQuiz("q3");
        return original.apply(this, args);
      });
      const quizId = await ownerQuizId("q3");
      const response = await postPractice(answer("q3", CORRECT));
      expect(response.status).toBe(404);
      expect(await response.json()).toMatchObject({ code: "QUIZ_NOT_FOUND" });
      await expectNoRowsOfQuiz(quizId);
    });

    it("answers 404 when the quiz is deleted between ID lookup and the placeholder insert", async () => {
      const { default: UserQuizStateInfra } =
        await import("./interfaces/infra/UserQuizStateInfra.js");
      const prototype = UserQuizStateInfra.prototype as unknown as {
        resolveIds: (uid: string, qid: string) => Promise<unknown>;
      };
      const original = prototype.resolveIds;
      vi.spyOn(prototype, "resolveIds").mockImplementationOnce(async function (
        this: unknown,
        uid: string,
        qid: string,
      ) {
        const ids = await original.call(this, uid, qid);
        await deleteQuiz("q3");
        return ids;
      });
      const quizId = await ownerQuizId("q3");
      const response = await postPractice(answer("q3", CORRECT));
      expect(response.status).toBe(404);
      expect(await response.json()).toMatchObject({ code: "QUIZ_NOT_FOUND" });
      await expectNoRowsOfQuiz(quizId);
    });

    it("returns the original body from one snapshot even if the quiz is deleted mid-replay", async () => {
      const { default: GrowthEventInfra } =
        await import("./interfaces/infra/GrowthEventInfra.js");
      const body = answer("q3", CORRECT);
      const first = await postPractice(body);
      const firstBody = await first.json();
      expect(firstBody.outcome.growthEvents).toEqual(["FIRST_CORRECT"]);

      const original = GrowthEventInfra.prototype.listTypesByHistoryId;
      vi.spyOn(
        GrowthEventInfra.prototype,
        "listTypesByHistoryId",
      ).mockImplementationOnce(async function (
        this: InstanceType<typeof GrowthEventInfra>,
        historyId,
      ) {
        // The saved history has already been read; delete on another connection.
        await deleteQuiz("q3");
        return original.call(this, historyId);
      });
      const retried = await postPractice(body);
      expect(retried.status).toBe(200);
      expect(await retried.json()).toEqual(firstBody);

      expect((await postPractice(body)).status).toBe(404);
    });

    it("answers 404 when the winner of a conflicting race is deleted before the loser re-reads it", async () => {
      const { default: UserQuizStateInfra } =
        await import("./interfaces/infra/UserQuizStateInfra.js");
      const { default: HistoryInfra } =
        await import("./interfaces/infra/HistoryInfra.js");
      const { default: DuplicateClientAttemptError } =
        await import("./domains/History/DuplicateClientAttemptError.js");
      const winner = answer("q3", CORRECT);
      const loser = { ...winner, judgement: WRONG };

      // The loser waits before taking the lock until the winner has committed.
      // The winner is sent from the test body, outside the loser's transaction context.
      let onLoserWaiting!: () => void;
      let releaseLoser!: () => void;
      const isLoserWaiting = new Promise<void>((resolve) => {
        onLoserWaiting = resolve;
      });
      const canLoserLock = new Promise<void>((resolve) => {
        releaseLoser = resolve;
      });
      const originalLock = UserQuizStateInfra.prototype.findOrCreateForUpdate;
      vi.spyOn(
        UserQuizStateInfra.prototype,
        "findOrCreateForUpdate",
      ).mockImplementationOnce(async function (
        this: InstanceType<typeof UserQuizStateInfra>,
        ...args
      ) {
        onLoserWaiting();
        await canLoserLock;
        return originalLock.apply(this, args);
      });
      let isLoserRolledBack = false;
      const originalAdd = HistoryInfra.prototype.add;
      vi.spyOn(HistoryInfra.prototype, "add").mockImplementation(
        async function (this: InstanceType<typeof HistoryInfra>, history) {
          try {
            return await originalAdd.call(this, history);
          } catch (error) {
            if (error instanceof DuplicateClientAttemptError) {
              isLoserRolledBack = true;
            }
            throw error;
          }
        },
      );
      const originalFind = HistoryInfra.prototype.findByClientAttemptId;
      vi.spyOn(
        HistoryInfra.prototype,
        "findByClientAttemptId",
      ).mockImplementation(async function (
        this: InstanceType<typeof HistoryInfra>,
        ...args
      ) {
        // The loser's transaction has rolled back, so this delete does not wait on its lock.
        if (isLoserRolledBack) {
          isLoserRolledBack = false;
          await deleteQuiz("q3");
        }
        return originalFind.apply(this, args);
      });

      const loserResponse = postPractice(loser);
      await isLoserWaiting;
      try {
        expect((await postPractice(winner)).status).toBe(200);
      } finally {
        releaseLoser();
      }
      const response = await loserResponse;
      expect(response.status).toBe(404);
      expect(await response.json()).toMatchObject({ code: "QUIZ_NOT_FOUND" });
    });

    it("treats a collation-equal qid as the saved quiz for both the first answer and the retry", async () => {
      await db
        .insertInto("quizzes")
        .values({
          id: 5,
          qid: "Ab",
          creator_id: 1,
          que: "question",
          ans: "answer",
          category_id: 2,
          workbook_id: 1,
          total_crct_ans: 0,
          total_wrng_ans: 0,
          total_through_ans: 0,
        })
        .execute();
      const body = answer("ab", CORRECT);
      const first = await postPractice(body);
      const retried = await postPractice(body);
      expect(first.status).toBe(200);
      expect(retried.status).toBe(200);
      const firstBody = await first.json();
      expect(firstBody.qid).toBe("Ab");
      expect(await retried.json()).toEqual(firstBody);
    });
  });

  describe("learning record backfill", () => {
    const createUseCase = async () => {
      const { default: BackfillLearningRecordUseCase } =
        await import("./applications/usecases/LearningRecord/BackfillLearningRecordUseCase.js");
      const { default: HistoryInfra } =
        await import("./interfaces/infra/HistoryInfra.js");
      const { default: UserQuizStateInfra } =
        await import("./interfaces/infra/UserQuizStateInfra.js");
      const { createReviewService } =
        await import("./interfaces/factories/createReviewService.js");
      const historyRepository = new HistoryInfra(manager);
      return {
        historyRepository,
        useCase: new BackfillLearningRecordUseCase(
          transactions,
          historyRepository,
          new UserQuizStateInfra(manager),
          createReviewService(),
        ),
      };
    };
    const snapshotTables = async () =>
      Promise.all([
        db.selectFrom("histories").selectAll().orderBy("id").execute(),
        db
          .selectFrom("user_quiz_states")
          .selectAll()
          .orderBy("user_id")
          .orderBy("quiz_id")
          .execute(),
        db.selectFrom("growth_events").selectAll().orderBy("id").execute(),
      ]);
    const owner = (qid: string, shouldApply: boolean) => ({
      uid: "owner",
      qid,
      shouldApply,
    });
    const historiesOf = async (quizId: number) =>
      db
        .selectFrom("histories")
        .select([
          "id",
          "judgement",
          "practice_mode",
          "review_settings_version",
          sql<string | null>`DATE_FORMAT(histories.study_date, '%Y-%m-%d')`.as(
            "study_date",
          ),
          "daily_attempt_number",
        ])
        .where("user_id", "=", 1)
        .where("quiz_id", "=", quizId)
        .orderBy("id")
        .execute();
    const stateOf = (quizId: number) =>
      db
        .selectFrom("user_quiz_states")
        .selectAll()
        .where("user_id", "=", 1)
        .where("quiz_id", "=", quizId)
        .executeTakeFirst();
    // tagging references quizzes with ON DELETE RESTRICT, so remove its rows first.
    const deleteQuizWithTags = async (qid: string) => {
      const quizId = (
        await db
          .selectFrom("quizzes")
          .select("id")
          .where("qid", "=", qid)
          .executeTakeFirstOrThrow()
      ).id;
      await db.deleteFrom("tagging").where("quiz_id", "=", quizId).execute();
      await db.deleteFrom("quizzes").where("id", "=", quizId).execute();
    };
    const insertLegacyHistory = (quizId: number, judgement: number, at: Date) =>
      db
        .insertInto("histories")
        .values({ user_id: 1, quiz_id: quizId, practiced: at, judgement })
        .execute();

    it("reports planned work without writing anything when not applying", async () => {
      const { useCase } = await createUseCase();
      const before = await snapshotTables();
      expect(await useCase.execute(owner("q1", false))).toEqual({
        uid: "owner",
        qid: "q1",
        isStateRebuilt: true,
        assignedStudyDayCount: 2,
        isDeletedPair: false,
      });
      expect(await snapshotTables()).toEqual(before);
    });

    it("compares the state and histories from one snapshot in a read-only check", async () => {
      const { useCase } = await createUseCase();
      await useCase.execute(owner("q1", true));
      const { default: UserQuizStateInfra } =
        await import("./interfaces/infra/UserQuizStateInfra.js");
      const original = UserQuizStateInfra.prototype.findByUidAndQid;
      vi.spyOn(
        UserQuizStateInfra.prototype,
        "findByUidAndQid",
      ).mockImplementationOnce(async function (
        this: InstanceType<typeof UserQuizStateInfra>,
        ...args
      ) {
        const state = await original.apply(this, args);
        // Another connection updates both the state and the histories.
        expect(
          (
            await postPractice({
              qid: "q1",
              judgement: 1,
              pressedWord: 0,
              clientAttemptId: randomUUID(),
            })
          ).status,
        ).toBe(200);
        return state;
      });
      expect((await useCase.execute(owner("q1", false))).isStateRebuilt).toBe(
        false,
      );
      expect(await useCase.execute(owner("q1", false))).toMatchObject({
        isStateRebuilt: false,
        assignedStudyDayCount: 0,
      });
    });

    it("detects an invalid judgement without a state row before applying, and reports it from the script", async () => {
      const { useCase, historyRepository } = await createUseCase();
      await insertLegacyHistory(3, 3, t(20));
      await expect(useCase.execute(owner("q3", false))).rejects.toThrow(
        RangeError,
      );
      const { runLearningRecordBackfill, listStatesWithoutHistory } =
        await import("./scripts/backfillLearningRecords.js");
      const summary = await runLearningRecordBackfill(false, {
        historyRepository,
        backfillPair: (command) => useCase.execute(command),
        listStatesWithoutHistory: () => listStatesWithoutHistory(db),
      });
      expect(summary.unreplayablePairs).toEqual([
        expect.objectContaining({ uid: "owner", qid: "q3" }),
      ]);
      expect(summary.failedPairs).toEqual([]);
    });

    it("treats pairs deleted after enumeration as deleted, not unreplayable", async () => {
      const { useCase, historyRepository } = await createUseCase();
      const pairs = await historyRepository.listAnsweredPairs(null, 200);
      expect(pairs).toContainEqual({ uid: "owner", qid: "q2" });
      await deleteQuizWithTags("q2");
      const before = await snapshotTables();
      for (const shouldApply of [false, true]) {
        expect(await useCase.execute(owner("q2", shouldApply))).toMatchObject({
          isDeletedPair: true,
          isStateRebuilt: false,
          assignedStudyDayCount: 0,
        });
      }
      expect(await snapshotTables()).toEqual(before);
    });

    it("treats a pair deleted between ID lookup and the placeholder insert as deleted", async () => {
      const { useCase, historyRepository } = await createUseCase();
      const { default: UserQuizStateInfra } =
        await import("./interfaces/infra/UserQuizStateInfra.js");
      const prototype = UserQuizStateInfra.prototype as unknown as {
        resolveIds: (uid: string, qid: string) => Promise<unknown>;
      };
      const original = prototype.resolveIds;
      let hasDeleted = false;
      vi.spyOn(prototype, "resolveIds").mockImplementation(async function (
        this: unknown,
        uid: string,
        qid: string,
      ) {
        const ids = await original.call(this, uid, qid);
        if (qid === "q2" && !hasDeleted) {
          hasDeleted = true;
          await deleteQuizWithTags(qid);
        }
        return ids;
      });
      const {
        runLearningRecordBackfill,
        listStatesWithoutHistory,
        hasBackfillProblems,
      } = await import("./scripts/backfillLearningRecords.js");
      const summary = await runLearningRecordBackfill(true, {
        historyRepository,
        backfillPair: (command) => useCase.execute(command),
        listStatesWithoutHistory: () => listStatesWithoutHistory(db),
      });
      expect(summary.deletedPairCount).toBe(1);
      expect(summary.unreplayablePairs).toEqual([]);
      expect(summary.failedPairs).toEqual([]);
      expect(hasBackfillProblems(summary)).toBe(false);
    });

    it("rebuilds the state and study days from legacy histories without inventing outcomes or events", async () => {
      const { useCase } = await createUseCase();
      expect(await useCase.execute(owner("q1", true))).toMatchObject({
        isStateRebuilt: true,
        assignedStudyDayCount: 2,
      });
      const state = await stateOf(1);
      expect(state?.review_count).toBe(2);
      expect(state?.fsrs_memory).not.toBeNull();
      expect(await historiesOf(1)).toEqual([
        expect.objectContaining({
          practice_mode: null,
          review_settings_version: null,
          study_date: "2026-10-20",
          daily_attempt_number: 1,
        }),
        expect.objectContaining({
          practice_mode: null,
          review_settings_version: null,
          study_date: "2026-10-21",
          daily_attempt_number: 1,
        }),
      ]);
      expect(
        await db.selectFrom("growth_events").selectAll().execute(),
      ).toEqual([]);

      const before = await snapshotTables();
      expect(await useCase.execute(owner("q1", true))).toMatchObject({
        isStateRebuilt: false,
        assignedStudyDayCount: 0,
      });
      expect(await snapshotTables()).toEqual(before);
    });

    it("keeps the state and daily numbers of answers saved through the API", async () => {
      const response = await postPractice({
        qid: "q3",
        judgement: 1,
        pressedWord: 0,
        clientAttemptId: randomUUID(),
      });
      expect(response.status).toBe(200);
      const beforeState = await stateOf(3);
      const beforeHistories = await historiesOf(3);
      const { useCase } = await createUseCase();
      expect(await useCase.execute(owner("q3", true))).toMatchObject({
        isStateRebuilt: false,
        assignedStudyDayCount: 0,
      });
      const afterState = await stateOf(3);
      expect(afterState?.review_count).toBe(beforeState?.review_count);
      expect(afterState?.next_review_at).toEqual(beforeState?.next_review_at);
      expect(await historiesOf(3)).toEqual(beforeHistories);
    });

    it("numbers two legacy histories in the same second by id", async () => {
      await insertLegacyHistory(3, 0, t(20));
      await insertLegacyHistory(3, 1, t(20));
      const { useCase } = await createUseCase();
      await useCase.execute(owner("q3", true));
      expect((await historiesOf(3)).map((h) => h.daily_attempt_number)).toEqual(
        [1, 2],
      );
    });

    it("throws for an invalid judgement and leaves the pair unchanged when applying", async () => {
      await insertLegacyHistory(3, 1, t(20));
      await insertLegacyHistory(3, 3, t(21));
      const { useCase } = await createUseCase();
      const before = await snapshotTables();
      await expect(useCase.execute(owner("q3", true))).rejects.toThrow(
        RangeError,
      );
      expect(await snapshotTables()).toEqual(before);
    });

    it("finds answered states without histories, which pair enumeration cannot see", async () => {
      await db
        .insertInto("user_quiz_states")
        .values({
          user_id: 1,
          quiz_id: 3,
          state: "REVIEWING",
          review_count: 1,
          interval_days: 1,
          last_reviewed_at: t(20),
          next_review_at: t(21),
          updated_at: t(20),
        })
        .execute();
      const { historyRepository } = await createUseCase();
      expect(
        await historyRepository.listAnsweredPairs(null, 200),
      ).not.toContainEqual({ uid: "owner", qid: "q3" });
      const { listStatesWithoutHistory } =
        await import("./scripts/backfillLearningRecords.js");
      expect(await listStatesWithoutHistory(db)).toEqual([
        { uid: "owner", qid: "q3" },
      ]);
    });
  });

  it("isolates interleaved transactions, reuses nested transactions, and restores context after failure", async () => {
    let entered!: () => void;
    let release!: () => void;
    const ready = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const rollback = transactions.begin(async () => {
      const trx = manager.getClient();
      await trx
        .insertInto("categories")
        .values({ id: 10, name: "rolled back" })
        .execute();
      entered();
      await gate;
      expect(manager.getClient()).toBe(trx);
      await transactions.begin(async () => {
        expect(manager.getClient()).toBe(trx);
      });
      throw new Error("rollback");
    });
    const failed = expect(rollback).rejects.toThrow("rollback");
    await ready;
    expect(manager.getClient()).toBe(db);
    try {
      await transactions.begin(async () => {
        await manager
          .getClient()
          .insertInto("categories")
          .values({ id: 11, name: "committed" })
          .execute();
      });
    } finally {
      release();
    }
    await failed;
    expect(manager.getClient()).toBe(db);
    expect(
      await db
        .selectFrom("categories")
        .select("id")
        .where("id", "in", [10, 11])
        .execute(),
    ).toEqual([{ id: 11 }]);
  });

  it("joins an outer transaction only when the requested isolation level matches", async () => {
    let ranWithMismatch = false;
    await transactions.begin(
      async () => {
        const trx = manager.getClient();
        await transactions.begin(
          async () => {
            expect(manager.getClient()).toBe(trx);
          },
          { isolationLevel: "read committed" },
        );
        // 分離レベルを指定しない内側は、従来どおり外側に相乗りする。
        await transactions.begin(async () => {
          expect(manager.getClient()).toBe(trx);
        });
        await expect(
          transactions.begin(
            async () => {
              ranWithMismatch = true;
            },
            { isolationLevel: "repeatable read" },
          ),
        ).rejects.toThrow(
          'A nested transaction requires "repeatable read", but the outer transaction uses "read committed"',
        );
      },
      { isolationLevel: "read committed" },
    );
    // 外側が指定なしだと実際の分離レベルはサーバー設定次第なので、指定のある内側は拒否する。
    await expect(
      transactions.begin(() =>
        transactions.begin(
          async () => {
            ranWithMismatch = true;
          },
          { isolationLevel: "read committed" },
        ),
      ),
    ).rejects.toThrow("the server default");
    expect(ranWithMismatch).toBe(false);
    expect(manager.getClient()).toBe(db);
  });

  it("uses one row per owned quiz and the authenticated user's latest judgement", async () => {
    const all = await quizzes.findMany("owner");
    expect(all.map((q) => [q.qid, q.judgement])).toEqual([
      ["q3", undefined],
      ["q2", 0],
      ["q1", 1],
    ]);
    expect(all[0].category?.map((c) => c.name)).toEqual(["root", "child"]);
    expect(await quizzes.count("owner")).toBe(3);
    expect(
      (await quizzes.findMany("owner", { judgements: 3 })).map((q) => q.qid),
    ).toEqual(["q3"]);
    expect(
      (await quizzes.findMany("owner", { judgements: 0 })).map((q) => q.qid),
    ).toEqual(["q2"]);
    expect(
      await quizzes.count("owner", {
        since: t(20).getTime(),
        until: t(20).getTime(),
      }),
    ).toBe(0);
    expect(
      (await quizzes.findMany("owner", { maxView: 1, page: 2 })).map(
        (q) => q.qid,
      ),
    ).toEqual(["q2"]);
  });

  it("looks up owned quizzes in requested order with the same details as search", async () => {
    const all = await quizzes.findMany("owner");
    const params = new URLSearchParams(
      ["q1", "q4", "q3", "missing", "q1", "q2"].map((qid) => ["qids", qid]),
    );
    const response = await app.request(`/api/quizzes/by-ids?${params}`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(
      JSON.parse(
        JSON.stringify(
          ["q1", "q3", "q2"].map((qid) => all.find((q) => q.qid === qid)),
        ),
      ),
    );

    const unavailable = await app.request(
      "/api/quizzes/by-ids?qids=q4&qids=missing",
    );
    expect(unavailable.status).toBe(200);
    expect(await unavailable.json()).toEqual([]);
    expect(await quizzes.findByQids("other", ["q1", "q4"])).toEqual([
      expect.objectContaining({ qid: "q4", creatorId: "other" }),
    ]);
    expect(await quizzes.findByQids("owner", [])).toEqual([]);
  });

  it("lists and counts each attempt with its own period and judgement", async () => {
    const option = {
      history: true,
      since: t(20).getTime(),
      until: t(22).getTime(),
    };
    const attempts = await quizzes.findMany("owner", option);
    expect(attempts.map((q) => [q.qid, q.judgement])).toEqual([
      ["q2", 0],
      ["q1", 1],
      ["q2", 1],
      ["q1", 0],
    ]);
    expect(await quizzes.count("owner", option)).toBe(4);
    expect(
      await quizzes.findMany("owner", { ...option, maxView: 1, page: 4 }),
    ).toEqual([attempts[3]]);
    const filtered = { ...option, until: t(20).getTime(), judgements: [0] };
    expect(
      (await quizzes.findMany("owner", filtered)).map((q) => [
        q.qid,
        q.judgement,
      ]),
    ).toEqual([["q1", 0]]);
    expect(await quizzes.count("owner", filtered)).toBe(1);
  });

  it.each(["book", ["book"]])(
    "lists workbook quizzes in registration order across pages: %j",
    async (wids) => {
      const expected = ["q1", "q2", "q3"];
      expect(
        (await quizzes.findMany("owner", { wids })).map((quiz) => quiz.qid),
      ).toEqual(expected);
      for (let page = 1; page <= expected.length; page++) {
        expect(
          (await quizzes.findMany("owner", { wids, maxView: 1, page })).map(
            (quiz) => quiz.qid,
          ),
        ).toEqual([expected[page - 1]]);
      }
      expect(
        (await quizzes.findMany("owner", { wids: [] })).map((quiz) => quiz.qid),
      ).toEqual([...expected].reverse());
    },
  );

  it.each([0, 12345])(
    "keeps seeded quiz order stable across answers and pages (seed %s)",
    async (seed) => {
      const key = (qid: string) =>
        createHash("md5").update(`${seed}:${qid}`).digest("hex");
      const expected = ["q1", "q2", "q3"].sort((a, b) =>
        key(a).localeCompare(key(b)),
      );
      const ids = async (option = {}) =>
        (await quizzes.findMany("owner", { seed, ...option })).map(
          (q) => q.qid,
        );
      expect(await ids()).toEqual(expected);
      expect(await ids({ wids: ["book"] })).toEqual(expected);
      await db
        .updateTable("quizzes")
        .set({ total_crct_ans: 10 })
        .where("qid", "=", "q1")
        .execute();
      expect(await ids()).toEqual(expected);
      for (let page = 1; page <= expected.length; page++) {
        expect(await ids({ maxView: 1, page })).toEqual([expected[page - 1]]);
      }
    },
  );

  it.each([
    [{ tags: ["a", "b"] }, ["q2", "q1"]],
    [{ tags: ["a", "a", "b"], tagMatchAll: true }, ["q1"]],
    [
      {
        categories: [2],
        wids: "book",
        keyword: "question",
        keywordOption: 2,
        tags: "a",
        isFavorite: true,
        mid: "mine",
        judgements: [1],
        since: t(21).getTime(),
        until: t(22).getTime(),
        crctAnsRatio: [50, 50],
      },
      ["q1"],
    ],
    [{ mid: "theirs" }, []],
    [{ crctAnsRatio: [0, 100] }, ["q2", "q1"]],
    [{ tags: "missing" }, []],
  ] as const)(
    "shares all filters between list and count: %j",
    async (filter, expected) => {
      const option = JSON.parse(JSON.stringify(filter));
      expect(
        (await quizzes.findMany("owner", option)).map((q) => q.qid),
      ).toEqual(expected);
      expect(await quizzes.count("owner", option)).toBe(expected.length);
    },
  );

  it("checks ownership on every mylist registration route and waits for writes", async () => {
    for (const [url, method, body] of [
      ["/api/register", "POST", { qid: "q1", mid: "theirs" }],
      ["/api/unregister", "POST", { qid: "q1", mid: "theirs" }],
      ["/api/mylists/quiz", "PUT", { quizId: 1, mid: "theirs" }],
      ["/api/mylists/quiz", "DELETE", { quizId: 1, mid: "theirs" }],
    ] as const) {
      const response = await app.request(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      expect(response.status).toBe(404);
    }
    const registration = await app.request("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ qid: "q3", mid: "mine" }),
    });
    expect(registration.status).toBe(201);
    expect(
      await db
        .selectFrom("mylists_quizzes")
        .select("quiz_id")
        .where("quiz_id", "=", 3)
        .execute(),
    ).toHaveLength(1);
    const removal = await app.request("/api/unregister", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ qid: "q3", mid: "mine" }),
    });
    expect(removal.status).toBe(201);
    expect(
      await db
        .selectFrom("mylists_quizzes")
        .select("quiz_id")
        .where("quiz_id", "=", 3)
        .execute(),
    ).toHaveLength(0);
  });

  it("rejects another user's quiz deletion and returns 404 for missing quizzes", async () => {
    expect(
      (await app.request("/api/quizzes/q4", { method: "DELETE" })).status,
    ).toBe(403);
    expect(
      (await app.request("/api/quizzes/missing", { method: "DELETE" })).status,
    ).toBe(404);
    expect(
      await db
        .selectFrom("quizzes")
        .select("id")
        .where("id", "=", 4)
        .executeTakeFirst(),
    ).toBeDefined();
  });

  it("deletes an owned quiz while retaining tags shared by another quiz", async () => {
    const response = await app.request("/api/quizzes/q1", { method: "DELETE" });
    expect(response.status).toBe(204);
    expect(
      await db.selectFrom("quizzes").select("id").where("id", "=", 1).execute(),
    ).toHaveLength(0);
    expect(
      await db
        .selectFrom("tags")
        .select("label")
        .where("label", "=", "a")
        .execute(),
    ).toHaveLength(1);
    expect(
      await db
        .selectFrom("tags")
        .select("label")
        .where("label", "=", "b")
        .execute(),
    ).toHaveLength(0);
  });

  it("preserves single-create/update contracts and clears removed workbook references", async () => {
    const request = (body: object, method = "POST", url = "/api/quizzes") =>
      app.request(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    const created = await request({
      question: "single-create",
      answer: "answer",
      anotherAnswer: "alternate",
      wid: "book",
      category: 2,
    });
    expect(created.status).toBe(201);
    expect(await created.text()).toBe("");
    const row = await db
      .selectFrom("quizzes")
      .select(["qid", "workbook_id"])
      .where("que", "=", "single-create")
      .executeTakeFirstOrThrow();
    expect(await quizzes.findByQid(row.qid)).toMatchObject({
      wid: "book",
      anotherAnswer: "alternate",
    });
    const updated = await request(
      {
        question: "single-create",
        answer: "changed",
        wid: null,
        category: null,
      },
      "PUT",
      `/api/quizzes/${row.qid}`,
    );
    expect(updated.status).toBe(201);
    expect(
      await db
        .selectFrom("quizzes")
        .select(["workbook_id", "category_id"])
        .where("qid", "=", row.qid)
        .executeTakeFirstOrThrow(),
    ).toEqual({ workbook_id: null, category_id: null });
    expect(
      (
        await request({
          question: "bad-reference",
          answer: "answer",
          wid: "other-book",
        })
      ).status,
    ).toBe(400);
  });

  it("persists Japanese CSV alternate answers and category hierarchy", async () => {
    const form = new FormData();
    form.append(
      "file",
      new File(
        [
          "問題,答え,別解等,正誤判定基準,大ジャンル,小ジャンル\ncsv-child,A,別解,基準,root,child\ncsv-root,B,,,root,",
        ],
        "quiz.csv",
      ),
    );
    const parsed = await app.request("/api/csv/parse", {
      method: "POST",
      body: form,
    });
    expect(parsed.status).toBe(200);
    const response = await app.request("/api/quizzes/multiple", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ records: await parsed.json() }),
    });
    expect(response.status).toBe(201);
    const rows = await db
      .selectFrom("quizzes")
      .select(["que", "ans", "anoans", "category_id"])
      .where("que", "like", "csv-%")
      .orderBy("que")
      .execute();
    expect(rows).toEqual([
      { que: "csv-child", ans: "A", anoans: "別解\n基準", category_id: 2 },
      { que: "csv-root", ans: "B", anoans: null, category_id: 1 },
    ]);
  });

  it("returns unknown CSV genres for correction without saving until submitted", async () => {
    const form = new FormData();
    form.append(
      "file",
      new File(
        ["問題,答え,大ジャンル,小ジャンル\ncsv-corrected,A,unknown,child"],
        "quiz.csv",
      ),
    );
    const parsed = await app.request("/api/csv/parse", {
      method: "POST",
      body: form,
    });
    expect(parsed.status).toBe(200);
    const records = await parsed.json();
    expect(records).toEqual([
      expect.objectContaining({
        question: "csv-corrected",
        categoryName: "unknown",
        subCategoryName: "child",
        categoryError: expect.any(String),
      }),
    ]);
    expect(records[0].category).toBeUndefined();
    expect(
      await db
        .selectFrom("quizzes")
        .select("id")
        .where("que", "=", "csv-corrected")
        .execute(),
    ).toEqual([]);
    const saved = await app.request("/api/quizzes/multiple", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        records: [
          {
            question: records[0].question,
            answer: records[0].answer,
            category: 2,
          },
        ],
      }),
    });
    expect(saved.status).toBe(201);
    expect(
      await db
        .selectFrom("quizzes")
        .select("category_id")
        .where("que", "=", "csv-corrected")
        .executeTakeFirstOrThrow(),
    ).toEqual({ category_id: 2 });
  });

  it("bulk inserts quizzes and deduplicated tags, and validates references before saving", async () => {
    await bulk.execute("owner", [
      {
        question: "bulk1",
        answer: "a",
        tagLabels: ["new", "new", "a", "A"],
        wid: "BOOK",
        categoryId: 2,
      },
      { question: "bulk2", answer: "b", tagLabels: ["new"] },
    ]);
    const rows = await db
      .selectFrom("quizzes")
      .select("id")
      .where("que", "like", "bulk%")
      .execute();
    expect(rows).toHaveLength(2);
    expect(
      await db
        .selectFrom("tagging")
        .selectAll()
        .where(
          "quiz_id",
          "in",
          rows.map((r) => r.id),
        )
        .execute(),
    ).toHaveLength(3);
    await expect(
      bulk.execute("owner", [
        {
          question: "bad",
          answer: "a",
          tagLabels: ["never-saved"],
          wid: "other-book",
        },
      ]),
    ).rejects.toMatchObject({ status: 400 });
    expect(
      await db
        .selectFrom("tags")
        .select("id")
        .where("label", "=", "never-saved")
        .execute(),
    ).toHaveLength(0);
  });

  it("rolls back both quizzes and new tags when tagging fails mid-import", async () => {
    const { sql } = await import("kysely");
    await sql`CREATE TRIGGER reject_test_tagging BEFORE INSERT ON tagging FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'injected tagging failure'`.execute(
      db,
    );
    try {
      await expect(
        bulk.execute("owner", [
          {
            question: "rollback-bulk",
            answer: "a",
            tagLabels: ["rollback-tag"],
          },
        ]),
      ).rejects.toThrow("injected tagging failure");
    } finally {
      await sql`DROP TRIGGER reject_test_tagging`.execute(db);
    }
    expect(
      await db
        .selectFrom("quizzes")
        .select("id")
        .where("que", "=", "rollback-bulk")
        .execute(),
    ).toHaveLength(0);
    expect(
      await db
        .selectFrom("tags")
        .select("id")
        .where("label", "=", "rollback-tag")
        .execute(),
    ).toHaveLength(0);
  });

  it("aggregates seven Japan-time periods in one SQL statement with exclusive end boundaries", async () => {
    const { default: Analysis } =
      await import("./interfaces/infra/AnalysisQueryService.js");
    const midnight = new Date("2026-10-26T15:00:00Z");
    await db
      .insertInto("histories")
      .values([
        {
          user_id: 1,
          quiz_id: 1,
          practiced: new Date(midnight.getTime() - 1000),
          judgement: 1,
        },
        { user_id: 1, quiz_id: 1, practiced: midnight, judgement: 0 },
      ])
      .execute();
    const spy = vi.spyOn(db.getExecutor(), "executeQuery");
    const result = await new Analysis().status(1, "2026-10-27", "day");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(7);
    expect(result[0]).toMatchObject({
      start: "2026-10-27 00:00:00",
      wrong: 1,
      right: 0,
      through: 0,
    });
    expect(result[1]).toMatchObject({ right: 1, wrong: 0 });
  });

  it("fetches categories once per list request and terminates on a category cycle", async () => {
    const spy = vi.spyOn(db.getExecutor(), "executeQuery");
    await quizzes.findMany("owner");
    expect(
      spy.mock.calls.filter(([query]) => /from `categories`/.test(query.sql)),
    ).toHaveLength(1);
    await db
      .updateTable("categories")
      .set({ parent_id: 2 })
      .where("id", "=", 1)
      .execute();
    await expect(quizzes.findMany("owner")).rejects.toThrow(
      "Cyclic category hierarchy",
    );
  });

  it("returns structured 500 errors for analysis database failures", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(db, "selectFrom").mockImplementation(() => {
      throw new Error("unavailable");
    });
    const response = await app.request("/api/analysis/ranking/all/day");
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({
      title: "INTERNAL_PROBLEMS",
      status: 500,
    });
  });
  it("refuses invalid IDs before index DDL and applies the migration through Prisma", async () => {
    const { createConnection } = await import("mysql2/promise");
    const url = new URL(process.env.DATABASE_URL!);
    const connection = await createConnection({
      host: url.hostname,
      port: Number(url.port),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      multipleStatements: true,
    });
    const migration = await readFile(
      new URL(
        "../prisma/migrations/20261026000000_api_query_indexes/migration.sql",
        import.meta.url,
      ),
      "utf8",
    );
    try {
      await connection.query(`DROP INDEX quizzes_qid_key ON quizzes;
        DROP INDEX workbooks_wid_key ON workbooks; DROP INDEX mylists_mid_key ON mylists;
        DROP INDEX histories_user_practiced_idx ON histories; DROP INDEX histories_practiced_user_idx ON histories;`);
      for (const [table, column, id, invalidValue, original] of [
        ["quizzes", "qid", 2, "q1", "q2"],
        ["workbooks", "wid", 2, "", "other-book"],
        ["mylists", "mid", 2, "mine", "theirs"],
      ] as const) {
        await connection.query(
          `UPDATE \`${table}\` SET \`${column}\` = ? WHERE id = ?`,
          [invalidValue, id],
        );
        await expect(connection.query(migration)).rejects.toThrow(
          "API index preflight failed",
        );
        const [rows] = await connection.query(
          "SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND INDEX_NAME IN ('quizzes_qid_key', 'workbooks_wid_key', 'mylists_mid_key', 'histories_user_practiced_idx', 'histories_practiced_user_idx')",
        );
        expect(rows).toHaveLength(0);
        await connection.query(
          `UPDATE \`${table}\` SET \`${column}\` = ? WHERE id = ?`,
          [original, id],
        );
      }
      const dir = await mkdtemp(path.join(os.tmpdir(), "iqbe-migration-"));
      try {
        const { mkdir } = await import("node:fs/promises");
        await writeFile(
          path.join(dir, "schema.prisma"),
          await readFile(new URL("../prisma/schema.prisma", import.meta.url)),
        );
        await mkdir(path.join(dir, "migrations/0_test_baseline"), {
          recursive: true,
        });
        await mkdir(
          path.join(dir, "migrations/20261026000000_api_query_indexes"),
        );
        await writeFile(
          path.join(dir, "migrations/0_test_baseline/migration.sql"),
          "-- schema created by db push for this test only",
        );
        await writeFile(
          path.join(
            dir,
            "migrations/20261026000000_api_query_indexes/migration.sql",
          ),
          migration,
        );
        await writeFile(
          path.join(dir, "migrations/migration_lock.toml"),
          'provider = "mysql"\n',
        );
        const prisma = ["node_modules/prisma/build/index.js", "migrate"];
        execFileSync(
          process.execPath,
          [
            ...prisma,
            "resolve",
            "--applied",
            "0_test_baseline",
            "--schema",
            path.join(dir, "schema.prisma"),
          ],
          { env: process.env, stdio: "pipe" },
        );
        execFileSync(
          process.execPath,
          [...prisma, "deploy", "--schema", path.join(dir, "schema.prisma")],
          { env: process.env, stdio: "pipe" },
        );
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
      const [rows] = await connection.query(
        "SELECT DISTINCT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND INDEX_NAME IN ('quizzes_qid_key', 'workbooks_wid_key', 'mylists_mid_key', 'histories_user_practiced_idx', 'histories_practiced_user_idx')",
      );
      expect(rows).toHaveLength(5);
    } finally {
      await connection.end();
    }
  }, 60000);

  (process.env.API_BENCHMARK === "1" ? it : it.skip)(
    "benchmarks equivalent aggregation/count SQL and inspects history index plans",
    async () => {
      const { sql } = await import("kysely");
      const { default: Analysis } =
        await import("./interfaces/infra/AnalysisQueryService.js");
      const { generateRange } = await import("./plugins/day.js");
      const ids = Array.from({ length: 2000 }, (_, index) => index + 100);
      for (let offset = 0; offset < ids.length; offset += 500)
        await db
          .insertInto("quizzes")
          .values(
            ids.slice(offset, offset + 500).map((id) => ({
              id,
              qid: `bench-${id}`,
              que: "benchmark",
              ans: "answer",
              creator_id: 1,
              category_id: 2,
            })),
          )
          .execute();
      const histories = ids.flatMap((quiz_id) =>
        Array.from({ length: 12 }, (_, attempt) => ({
          user_id: 1,
          quiz_id,
          judgement: attempt % 3,
          practiced: new Date(
            Date.parse("2026-09-28T15:00:00Z") +
              ((quiz_id * 7 + attempt) % 30) * 86400000 +
              attempt * 60000,
          ),
        })),
      );
      for (let offset = 0; offset < histories.length; offset += 1000)
        await db
          .insertInto("histories")
          .values(histories.slice(offset, offset + 1000))
          .execute();
      await sql`ANALYZE TABLE histories, quizzes`.execute(db);
      const { count: historyCount } = await db
        .selectFrom("histories")
        .select(({ fn }) => fn.countAll<number>().as("count"))
        .executeTakeFirstOrThrow();
      const ranges = generateRange("2026-10-26", "day");
      const legacyStatus = () =>
        Promise.all(
          ranges.map(async ([start, end]) => {
            const values: number[] = [];
            for (const judgement of [1, 0, 2]) {
              const row = await db
                .selectFrom("histories")
                .select(({ fn }) => fn.count("quiz_id").as("count"))
                .where("user_id", "=", 1)
                .where("judgement", "=", judgement)
                .where("practiced", ">=", start)
                .where("practiced", "<", end)
                .executeTakeFirstOrThrow();
              values.push(Number(row.count));
            }
            return { right: values[0], wrong: values[1], through: values[2] };
          }),
        );
      const analysis = new Analysis();
      const newStatus = () => analysis.status(1, "2026-10-26", "day");
      expect(
        (await newStatus()).map(({ right, wrong, through }) => ({
          right,
          wrong,
          through,
        })),
      ).toEqual(await legacyStatus());
      const legacyCount = async () => {
        const user = await db
          .selectFrom("users")
          .select("id")
          .where("uid", "=", "owner")
          .executeTakeFirstOrThrow();
        const rows = await db
          .selectFrom("quizzes")
          .select(({ fn }) => fn.countAll<number>().over().as("size"))
          .where("creator_id", "=", user.id)
          .execute();
        return Number(rows[0]?.size ?? 0);
      };
      expect(await quizzes.count("owner")).toBe(await legacyCount());
      const measure = async (fn: () => Promise<unknown>) => {
        for (let i = 0; i < 3; i++) await fn();
        let queries = 0;
        let rows = 0;
        const executor = db.getExecutor();
        const execute = executor.executeQuery.bind(executor);
        const spy = vi
          .spyOn(executor, "executeQuery")
          .mockImplementation(async (...args) => {
            const result = await execute(...args);
            queries++;
            rows += result.rows.length;
            return result;
          });
        const times: number[] = [];
        try {
          for (let i = 0; i < 20; i++) {
            const start = performance.now();
            await fn();
            times.push(performance.now() - start);
          }
        } finally {
          spy.mockRestore();
        }
        times.sort((a, b) => a - b);
        return {
          p95Ms: Number(times[18].toFixed(3)),
          sqlPerRequest: queries / 20,
          rowsPerRequest: rows / 20,
        };
      };
      await sql`DROP INDEX histories_user_practiced_idx ON histories`.execute(
        db,
      );
      await sql`DROP INDEX histories_practiced_user_idx ON histories`.execute(
        db,
      );
      const explain = async () => {
        const personal =
          await sql`EXPLAIN ANALYZE SELECT COUNT(*) FROM histories WHERE user_id = 1 AND practiced >= ${ranges[0][0]} AND practiced < ${ranges[0][1]}`.execute(
            db,
          );
        const ranking =
          await sql`EXPLAIN ANALYZE SELECT user_id, COUNT(*) FROM histories WHERE practiced >= ${ranges[0][0]} AND practiced < ${ranges[0][1]} GROUP BY user_id ORDER BY COUNT(*) DESC LIMIT 5`.execute(
            db,
          );
        return { personal: personal.rows, ranking: ranking.rows };
      };
      const before = {
        analysis: await measure(legacyStatus),
        count: await measure(legacyCount),
        plans: await explain(),
      };
      const withoutIndexes = {
        analysis: await measure(newStatus),
        count: await measure(() => quizzes.count("owner")),
      };
      await sql`CREATE INDEX histories_user_practiced_idx ON histories(user_id, practiced)`.execute(
        db,
      );
      await sql`CREATE INDEX histories_practiced_user_idx ON histories(practiced, user_id)`.execute(
        db,
      );
      await sql`ANALYZE TABLE histories`.execute(db);
      const after = {
        analysis: await measure(newStatus),
        count: await measure(() => quizzes.count("owner")),
        plans: await explain(),
      };
      const report = {
        mysql: "9.1",
        samples: 20,
        quizzes: 2004,
        histories: Number(historyCount),
        before,
        withoutIndexes,
        after,
      };
      await writeFile(
        path.join(os.tmpdir(), "iqbe-api-benchmark.json"),
        JSON.stringify(report, null, 2),
      );
      expect(JSON.stringify(after.plans.personal)).toContain(
        "histories_user_practiced_idx",
      );
      expect(JSON.stringify(after.plans.ranking)).toContain(
        "histories_practiced_user_idx",
      );
      console.log(
        JSON.stringify({
          benchmark: {
            ...report,
            before: { ...before, plans: undefined },
            after: { ...after, plans: undefined },
          },
        }),
      );
    },
    120000,
  );
});
