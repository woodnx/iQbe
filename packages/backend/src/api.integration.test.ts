import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { jest } from "@jest/globals";
import type { StartedMySqlContainer } from "@testcontainers/mysql";
import { createMiddleware } from "hono/factory";
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
          "--skip-generate",
          "--schema",
          path.join(dir, "schema.prisma"),
        ],
        { env: process.env, stdio: "pipe" },
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
    ({ db } = await import("./database.js"));
    const { default: Manager } = await import(
      "./interfaces/infra/kysely/KyselyClientManager.js"
    );
    const { default: Transactions } = await import(
      "./interfaces/infra/kysely/KyselyTransactionManager.js"
    );
    const { default: QuizInfra } = await import(
      "./interfaces/infra/QuizInfra.js"
    );
    const { default: CategoryInfra } = await import(
      "./interfaces/infra/CategoryInfra.js"
    );
    const { default: QuizBulkInfra } = await import(
      "./interfaces/infra/QuizBulkInfra.js"
    );
    const { AddQuizzesUseCase } = await import(
      "./applications/usecases/Quiz/AddQuizzesUseCase.js"
    );
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

  afterEach(() => jest.restoreAllMocks());
  afterAll(async () => {
    if (db) await db.destroy();
    if (container) await container.stop();
  }, 30000);
  const t = (day: number) =>
    new Date(`2026-10-${String(day).padStart(2, "0")}T12:00:00Z`);
  beforeEach(async () => {
    for (const table of [
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
    const { default: Analysis } = await import(
      "./interfaces/infra/AnalysisQueryService.js"
    );
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
    const spy = jest.spyOn(db.getExecutor(), "executeQuery");
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
    const spy = jest.spyOn(db.getExecutor(), "executeQuery");
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
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(db, "selectFrom").mockImplementation(() => {
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
      const { default: Analysis } = await import(
        "./interfaces/infra/AnalysisQueryService.js"
      );
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
        const spy = jest
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
