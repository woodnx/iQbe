import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { jest } from "@jest/globals";
import { hc } from "hono/client";
import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";
import type { AppType } from "./app.js";
import type { AppEnv, AuthUser } from "./http/context.js";

const user: AuthUser = {
  userId: 1,
  uid: "http-test-user",
  username: "tester",
  permission: "SUPER_USER",
  isSuperUser: true,
  iat: 0,
  exp: 9999999999,
};
const authenticate = createMiddleware<AppEnv>(async (c, next) => {
  c.set("user", user);
  await next();
});
let createApp: typeof import("./app.js").createApp;
let db: typeof import("./database.js").db;
let app: AppType;
let temporary: string;

beforeAll(async () => {
  process.env.DATABASE_URL ||= "mysql://test:test@127.0.0.1:3306/test";
  process.env.JWT_SECRET_KEY = "http-regression-test-secret";
  ({ createApp } = await import("./app.js"));
  ({ db } = await import("./database.js"));
  temporary = await fs.mkdtemp(path.join(os.tmpdir(), "iqbe-hono-"));
  await fs.mkdir(path.join(temporary, "web"));
  await fs.mkdir(path.join(temporary, "public"));
  await fs.writeFile(
    path.join(temporary, "web/index.html"),
    "<html>SPA</html>",
  );
  await fs.writeFile(path.join(temporary, "public/asset.txt"), "public asset");
  app = createApp({
    authenticate,
    webRoot: path.join(temporary, "web"),
    publicRoot: path.join(temporary, "public"),
  });
});
afterEach(() => jest.restoreAllMocks());
afterAll(async () => {
  await db.destroy();
  await fs.rm(temporary, { recursive: true, force: true });
});

const jsonRequest = (url: string, body: unknown, method = "POST") =>
  app.request(url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

describe("HTTP routing and authentication", () => {
  it("requires authentication on every protected endpoint", async () => {
    const secured = createApp({
      webRoot: path.join(temporary, "web"),
      publicRoot: path.join(temporary, "public"),
    });
    const endpoints = secured.routes.filter(
      (route) => route.path.startsWith("/api/") && route.method !== "ALL",
    );
    expect(endpoints.length).toBeGreaterThan(40);
    for (const route of endpoints) {
      if (route.path.startsWith("/api/auth/")) continue;
      const url = route.path.replace(/:[^/]+/g, "1");
      const response = await secured.request(url, { method: route.method });
      expect({ path: route.path, status: response.status }).toEqual({
        path: route.path,
        status: 401,
      });
      expect(await response.json()).toMatchObject({
        title: "NO_TOKEN",
        status: 401,
      });
    }
  });
  it.each(["login", "signup", "token", "register", "available"])(
    "validates public auth/%s without requiring a token",
    async (endpoint) => {
      const response = await createApp({
        webRoot: path.join(temporary, "web"),
        publicRoot: path.join(temporary, "public"),
      }).request(`/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        title: "INVAILD_PARAMS",
        status: 400,
      });
    },
  );
  it("returns errors for invalid and expired tokens", async () => {
    const secured = createApp({
      webRoot: path.join(temporary, "web"),
      publicRoot: path.join(temporary, "public"),
    });
    for (const [token, title] of [
      ["invalid", "INVAILD_TOKEN"],
      [
        jwt.sign({ uid: user.uid }, process.env.JWT_SECRET_KEY!, {
          expiresIn: -1,
        }),
        "EXPIRED_TOKEN",
      ],
    ]) {
      const response = await secured.request("/api/categories/preset", {
        headers: { Authorization: token },
      });
      expect(response.status).toBe(401);
      expect(await response.json()).toMatchObject({ title });
    }
  });
  it("loads the authenticated user and completes valid requests", async () => {
    const query = {
      select: () => query,
      where: () => query,
      executeTakeFirst: async () => ({
        userId: 1,
        uid: user.uid,
        username: user.username,
        permission: "SUPER_USER",
      }),
    };
    jest
      .spyOn(db, "selectFrom")
      .mockReturnValue(query as unknown as ReturnType<typeof db.selectFrom>);
    const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET_KEY!);
    const response = await createApp({
      webRoot: path.join(temporary, "web"),
      publicRoot: path.join(temporary, "public"),
    }).request("/api/categories/preset", { headers: { Authorization: token } });
    expect(response.status).toBe(200);
    expect(Array.isArray(await response.json())).toBe(true);
  });
  it("forwards database failures to the error handler instead of hanging", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(db, "selectFrom").mockImplementation(() => {
      throw new Error("database unavailable");
    });
    const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET_KEY!);
    const response = await createApp({
      webRoot: path.join(temporary, "web"),
      publicRoot: path.join(temporary, "public"),
    }).request("/api/categories/preset", { headers: { Authorization: token } });
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ title: "INTERNAL_PROBLEMS" });
  });
  it("resolves fixed paths before numeric category parameters", async () => {
    expect((await app.request("/api/categories/preset")).status).toBe(200);
    expect((await app.request("/api/categories/not-a-number")).status).toBe(
      400,
    );
  });
});

describe("validation and Hono RPC", () => {
  it.each([
    ["/api/quizzes", {}],
    ["/api/practice", { qid: "q", judgement: "wrong", pressedWord: 0 }],
    ["/api/workbooks", { name: 1 }],
    ["/api/register", { qid: "q" }],
    ["/api/categories", { name: "Test", disabled: "false" }],
  ])("rejects invalid input for %s", async (url, body) => {
    expect((await jsonRequest(url, body)).status).toBe(400);
  });
  it.each([
    "/api/quizzes?page=0",
    "/api/quizzes?page=1.5",
    "/api/quizzes?maxView=0",
    "/api/quizzes?judgements=4",
    "/api/quizzes?since=20&until=10",
    "/api/quizzes?crctAnsRatio=90&crctAnsRatio=20",
    "/api/analysis/ranking/all/day?limit=101",
    "/api/analysis/ranking/all/invalid",
    "/api/analysis/status/2026-02-30/day",
    "/api/analysis/status/invalid/day",
  ])("rejects out-of-range query %s", async (url) => {
    expect((await app.request(url)).status).toBe(400);
  });
  it("rejects empty and oversized bulk requests and oversized text", async () => {
    expect(
      (await jsonRequest("/api/quizzes/multiple", { records: [] })).status,
    ).toBe(400);
    expect(
      (
        await jsonRequest("/api/quizzes/multiple", {
          records: Array.from({ length: 1001 }, () => ({
            question: "Q",
            answer: "A",
          })),
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await jsonRequest("/api/quizzes", {
          question: "q".repeat(2049),
          answer: "A",
        })
      ).status,
    ).toBe(400);
  });
  it("forwards all count filters including scalar judgement zero", async () => {
    const { default: QuizInfra } = await import(
      "./interfaces/infra/QuizInfra.js"
    );
    const count = jest.spyOn(QuizInfra.prototype, "count").mockResolvedValue(1);
    const response = await app.request(
      "/api/quizzes/size?tags=a&categories=2&judgements=0&tagMatchAll=true&crctAnsRatio=0&crctAnsRatio=100",
    );
    expect(response.status).toBe(200);
    expect(count).toHaveBeenCalledWith(
      user.uid,
      expect.objectContaining({
        tags: "a",
        categories: 2,
        judgements: 0,
        tagMatchAll: true,
        crctAnsRatio: [0, 100],
      }),
    );
  });
  it("parses repeated and scalar array queries and false booleans", async () => {
    const { default: QuizInfra } = await import(
      "./interfaces/infra/QuizInfra.js"
    );
    const find = jest
      .spyOn(QuizInfra.prototype, "findMany")
      .mockResolvedValue([]);
    const response = await app.request(
      "/api/quizzes?page=2&maxView=25&wids=a&wids=b&judgements=0&judgements=2&categories=4&tags=one&tags=two&isFavorite=false&tagMatchAll=false",
    );
    expect(response.status).toBe(200);
    expect(find).toHaveBeenCalledWith(
      user.uid,
      expect.objectContaining({
        page: 2,
        maxView: 25,
        wids: ["a", "b"],
        judgements: [0, 2],
        categories: 4,
        tags: ["one", "two"],
        isFavorite: false,
        tagMatchAll: false,
      }),
    );
    expect((await app.request("/api/quizzes?maxView=101")).status).toBe(400);
    expect((await app.request("/api/quizzes?isFavorite=maybe")).status).toBe(
      400,
    );
  });
  it("preserves query defaults", async () => {
    const { default: QuizInfra } = await import(
      "./interfaces/infra/QuizInfra.js"
    );
    const find = jest
      .spyOn(QuizInfra.prototype, "findMany")
      .mockResolvedValue([]);
    await app.request("/api/quizzes");
    expect(find).toHaveBeenCalledWith(
      user.uid,
      expect.objectContaining({
        page: 1,
        maxView: 100,
        wids: [],
        isFavorite: false,
      }),
    );
  });
  it("accepts typed RPC JSON and returns the existing empty creation response", async () => {
    const { AddQuizUseCase } = await import(
      "./applications/usecases/Quiz/AddQuizUseCase.js"
    );
    const add = jest
      .spyOn(AddQuizUseCase.prototype, "execute")
      .mockResolvedValue({
        qid: "q",
        question: "Question",
        answer: "Answer",
        creatorId: user.uid,
        total: 0,
        right: 0,
        isFavorite: false,
      });
    const client = hc<AppType>("http://localhost", {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        app.request(input, init),
    });
    const response = await client.api.quizzes.$post({
      json: {
        question: "Question",
        answer: "Answer",
        anotherAnswer: null,
        tags: [],
        category: null,
        wid: null,
      },
    });
    expect(response.status).toBe(201);
    expect(await response.text()).toBe("");
    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({
        question: "Question",
        answer: "Answer",
        uid: user.uid,
      }),
    );
  });
  it("rejects malformed JSON and JSON bodies over 5 MB", async () => {
    const invalid = await app.request("/api/quizzes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    });
    expect(invalid.status).toBe(400);
    const oversized = await jsonRequest("/api/quizzes", {
      question: "x".repeat(5 * 1024 * 1024),
      answer: "a",
    });
    expect(oversized.status).toBe(413);
  });
});

describe("file uploads and static delivery", () => {
  it("parses CSV multipart files and rejects missing files", async () => {
    const form = new FormData();
    form.append(
      "file",
      new File(["question,answer,anotherAnswer\nQ,A,Other\n"], "quiz.csv", {
        type: "text/csv",
      }),
    );
    const response = await app.request("/api/csv/parse", {
      method: "POST",
      body: form,
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      { question: "Q", answer: "A", anotherAnswer: "Other" },
    ]);
    const missing = await app.request("/api/csv/parse", {
      method: "POST",
      body: new FormData(),
    });
    expect(missing.status).toBe(400);
    expect(await missing.json()).toMatchObject({ title: "NO_FILE" });
  });
  it.each(["/api/csv/parse", "/api/i/image"])(
    "limits multipart request size for %s",
    async (url) => {
      const form = new FormData();
      form.append("file", new File(["x".repeat(5 * 1024 * 1024)], "large.csv"));
      const response = await app.request(url, { method: "POST", body: form });
      expect(response.status).toBe(413);
      expect(await response.json()).toMatchObject({
        status: 413,
        title: "PAYLOAD_TOO_LARGE",
      });
    },
  );
  it("stores profile uploads with the existing filename and URL", async () => {
    const { default: UserInfra } = await import(
      "./interfaces/infra/UserInfra.js"
    );
    const { default: User } = await import("./domains/User/index.js");
    const profile = new User(
      user.uid,
      "hash",
      user.username,
      "",
      new Date(),
      new Date(),
    );
    jest.spyOn(UserInfra.prototype, "findByUid").mockResolvedValue(profile);
    jest.spyOn(UserInfra.prototype, "update").mockResolvedValue(undefined);
    const form = new FormData();
    const bytes = new Uint8Array([137, 80, 78, 71]);
    form.append("file", new File([bytes], "image.png", { type: "image/png" }));
    const filename = path.join(
      process.cwd(),
      "public/images",
      `${user.uid}.png`,
    );
    try {
      const response = await app.request("/api/i/image", {
        method: "POST",
        body: form,
      });
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        uid: user.uid,
        photoUrl: `/images/${user.uid}.png`,
      });
      expect(await fs.readFile(filename)).toEqual(Buffer.from(bytes));
      const images = createApp({
        authenticate,
        webRoot: path.join(temporary, "web"),
      });
      expect(
        new Uint8Array(
          await (await images.request(`/images/${user.uid}.png`)).arrayBuffer(),
        ),
      ).toEqual(bytes);
    } finally {
      await fs.rm(filename, { force: true });
    }
  });
  it("serves assets and SPA deep links while keeping API fallback separate", async () => {
    expect(await (await app.request("/asset.txt")).text()).toBe("public asset");
    expect(await (await app.request("/workbook/test")).text()).toBe(
      "<html>SPA</html>",
    );
    const missing = await app.request("/api/unknown");
    expect(missing.status).toBe(404);
    expect(await missing.json()).toMatchObject({
      title: "NOT_FOUND",
      status: 404,
    });
  });
  it("preserves allowed CORS origin, credentials and preflight status", async () => {
    const response = await app.request("/api/quizzes", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
      },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:5173",
    );
    expect(response.headers.get("access-control-allow-credentials")).toBe(
      "true",
    );
  });
});

describe("successful API contracts", () => {
  it("preserves workbook CRUD JSON, dates, status codes and authenticated ownership", async () => {
    const { default: WorkbookInfra } = await import(
      "./interfaces/infra/WorkbookInfra.js"
    );
    const { default: Workbook } = await import("./domains/Workbook/index.js");
    const records = new Map<string, InstanceType<typeof Workbook>>();
    jest
      .spyOn(WorkbookInfra.prototype, "save")
      .mockImplementation(async (workbook) => {
        records.set(workbook.wid, workbook);
      });
    const find = jest
      .spyOn(WorkbookInfra.prototype, "findByWid")
      .mockImplementation(async (wid) => records.get(wid) ?? null);
    jest
      .spyOn(WorkbookInfra.prototype, "findManyByUid")
      .mockImplementation(async () => [...records.values()]);
    jest
      .spyOn(WorkbookInfra.prototype, "update")
      .mockImplementation(async (workbook) => {
        records.set(workbook.wid, workbook);
      });
    jest
      .spyOn(WorkbookInfra.prototype, "delete")
      .mockImplementation(async (wid) => {
        records.delete(wid);
      });
    const created = await jsonRequest("/api/workbooks", {
      name: "Book",
      published: "2025-01-01T00:00:00.000Z",
    });
    expect(created.status).toBe(200);
    const body = await created.json();
    expect(body).toMatchObject({
      name: "Book",
      date: "2025-01-01T00:00:00.000Z",
      creatorId: user.uid,
      total: 0,
    });
    const list = await app.request("/api/workbooks");
    expect(await list.json()).toEqual([body]);
    const all = await app.request("/api/workbooks/all");
    expect(await all.json()).toEqual([body]);
    expect(find).not.toHaveBeenCalledWith("all", expect.anything());
    expect(
      await (await app.request(`/api/workbooks/${body.wid}`)).json(),
    ).toEqual(body);
    expect(find).toHaveBeenCalledWith(body.wid, user.uid);
    const updated = await jsonRequest(
      `/api/workbooks/${body.wid}`,
      { name: "Renamed", published: null },
      "PUT",
    );
    expect(updated.status).toBe(200);
    expect(await updated.json()).toMatchObject({ name: "Renamed" });
    const deleted = await app.request(`/api/workbooks/${body.wid}`, {
      method: "DELETE",
    });
    expect(deleted.status).toBe(200);
    expect(await deleted.json()).toEqual([]);
  });
  it("preserves auth login, signup, re-registration and token response fields", async () => {
    const { default: AuthUseCase } = await import(
      "./applications/usecases/AuthUseCase.js"
    );
    const userData = {
      uid: user.uid,
      username: user.username,
      created: "2025-01-01",
      modified: "2025-01-01",
    };
    const data = {
      user: userData,
      accessToken: "access",
      refreshToken: "refresh",
    };
    jest.spyOn(AuthUseCase.prototype, "loginUser").mockResolvedValue(data);
    jest.spyOn(AuthUseCase.prototype, "signupUser").mockResolvedValue(data);
    jest.spyOn(AuthUseCase.prototype, "registerUser").mockResolvedValue(data);
    jest
      .spyOn(AuthUseCase.prototype, "getToken")
      .mockResolvedValue({ accessToken: "access", user: userData });
    jest.spyOn(AuthUseCase.prototype, "available").mockResolvedValue(true);
    for (const endpoint of ["login", "signup", "register"]) {
      const response = await jsonRequest(`/api/auth/${endpoint}`, {
        username: "tester",
        password: "password",
        email: "tester@example.com",
      });
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(data);
    }
    expect(
      await (
        await jsonRequest("/api/auth/token", {
          uid: user.uid,
          refreshToken: "refresh",
        })
      ).json(),
    ).toEqual({ accessToken: "access", user: userData });
    expect(
      await (
        await jsonRequest("/api/auth/available", { username: "tester" })
      ).json(),
    ).toEqual({ available: true });
  });
  it("completes category updates with an empty response", async () => {
    const { UpdateCategoryUseCase } = await import(
      "./applications/usecases/Category/UpdateCategoryUseCase.js"
    );
    const update = jest
      .spyOn(UpdateCategoryUseCase.prototype, "execute")
      .mockResolvedValue(undefined);
    const response = await jsonRequest(
      "/api/categories/4",
      { name: "Category", description: "Description", disabled: false },
      "PUT",
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
    expect(update).toHaveBeenCalledWith({
      id: 4,
      description: "Description",
      disabled: false,
    });
  });
  it("keeps practice, favorite and mylist registration status codes", async () => {
    const { default: PracticeUseCase } = await import(
      "./applications/usecases/PracticeUseCase.js"
    );
    const { default: FavoriteUseCase } = await import(
      "./applications/usecases/FavoriteUseCase.js"
    );
    const { default: RegisterUseCase } = await import(
      "./applications/usecases/RegisterUseCase.js"
    );
    const practice = jest
      .spyOn(PracticeUseCase.prototype, "addPractice")
      .mockResolvedValue(undefined);
    jest
      .spyOn(FavoriteUseCase.prototype, "addFavorite")
      .mockResolvedValue(undefined);
    jest
      .spyOn(FavoriteUseCase.prototype, "removeFavorite")
      .mockResolvedValue(undefined);
    jest
      .spyOn(RegisterUseCase.prototype, "registerQuizToMylist")
      .mockResolvedValue(undefined);
    jest
      .spyOn(RegisterUseCase.prototype, "unregisterQuizFromMylist")
      .mockResolvedValue(undefined);
    for (const [url, body, status] of [
      ["/api/practice", { qid: "q", judgement: 0, pressedWord: 0 }, 200],
      ["/api/like", { qid: "q" }, 201],
      ["/api/unlike", { qid: "q" }, 201],
      ["/api/register", { qid: "q", mid: "m" }, 201],
      ["/api/unregister", { qid: "q", mid: "m" }, 201],
    ] as const) {
      const response = await jsonRequest(url, body);
      expect(response.status).toBe(status);
      expect(await response.text()).toBe("");
    }
    expect(practice).toHaveBeenCalledWith(user.uid, "q", 0, 0);
  });
});
