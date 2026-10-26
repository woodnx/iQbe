import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiClientError,
  cleanQuery,
  readJsonResponse,
  readResponse,
  rpc,
} from "./client";
import {
  QUIZZES_QUERY_KEY,
  restoreQuerySnapshot,
  takeQuerySnapshot,
  updateRelatedQuizSize,
} from "./queryCache";

vi.mock("storejs", () => ({ default: { set: vi.fn() } }));
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;
let storage: Map<string, string>;
beforeEach(() => {
  storage = new Map([
    ["accessToken", "old-token"],
    ["refreshToken", "refresh-token"],
    ["uid", "user"],
  ]);
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  fetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());
const problem = (title: string, status = 401) =>
  Response.json(
    { title, type: "about:blank", status, detail: "Request failed" },
    { status },
  );

describe("RPC transport", () => {
  it("serializes repeated queries, false and numeric zero while omitting null", async () => {
    fetchMock.mockResolvedValue(Response.json([]));
    await rpc.api.quizzes
      .$get({
        query: cleanQuery({
          wids: ["a", "b"],
          isFavorite: false,
          tagMatchAll: false,
          seed: 0,
          keyword: null,
        }),
      })
      .then(readResponse);
    const [url, init] = fetchMock.mock.calls[0];
    const params = new URL(String(url), "http://localhost").searchParams;
    expect(params.getAll("wids")).toEqual(["a", "b"]);
    expect(params.get("isFavorite")).toBe("false");
    expect(params.get("tagMatchAll")).toBe("false");
    expect(params.get("seed")).toBe("0");
    expect(params.has("keyword")).toBe(false);
    expect(new Headers(init?.headers).get("Authorization")).toBe("old-token");
  });
  it("sends ISO dates and named judgements for list and count requests", async () => {
    fetchMock.mockImplementation(async () => Response.json([]));
    for (const request of [rpc.api.quizzes.$get, rpc.api.quizzes.size.$get]) {
      await request({
        query: {
          since: "1970-01-01T00:00:00.000Z",
          until: "1970-01-01T00:00:00.001Z",
          judgements: ["wrong", "right", "through", "unanswered"],
        },
      }).then(readResponse);
    }
    for (const [url] of fetchMock.mock.calls) {
      const params = new URL(String(url), "http://localhost").searchParams;
      expect(params.get("since")).toBe("1970-01-01T00:00:00.000Z");
      expect(params.get("until")).toBe("1970-01-01T00:00:00.001Z");
      expect(params.getAll("judgements")).toEqual([
        "wrong",
        "right",
        "through",
        "unanswered",
      ]);
    }
  });
  it("throws a typed HTTP error for React Query mutations", async () => {
    fetchMock.mockImplementation(async () => problem("ACCESS_DENIED", 403));
    await expect(
      rpc.api.like.$post({ json: { qid: "q" } }).then(readResponse),
    ).rejects.toMatchObject({ title: "ACCESS_DENIED", status: 403 });
    await expect(
      rpc.api.like.$post({ json: { qid: "q" } }).then(readResponse),
    ).rejects.toBeInstanceOf(ApiClientError);
  });
  it("handles empty success bodies without trying to parse JSON", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    expect(
      await rpc.api.quizzes[":qid"]
        .$delete({ param: { qid: "q" } })
        .then(readResponse),
    ).toBeUndefined();
  });
  it("uploads multipart files without forcing a JSON content type", async () => {
    fetchMock.mockResolvedValue(
      Response.json([{ question: "Q", answer: "A", anotherAnswer: "" }]),
    );
    const file = new File(["question,answer\nQ,A"], "quiz.csv", {
      type: "text/csv",
    });
    await rpc.api.csv.parse.$post({ form: { file } }).then(readResponse);
    const [, init] = fetchMock.mock.calls[0];
    expect(init?.body).toBeInstanceOf(FormData);
    expect((init?.body as FormData).get("file")).toBe(file);
    expect(new Headers(init?.headers).has("Content-Type")).toBe(false);
  });
  it("passes AbortSignal through to fetch", async () => {
    fetchMock.mockResolvedValue(Response.json([]));
    const controller = new AbortController();
    await rpc.api.quizzes
      .$get({ query: {} }, { init: { signal: controller.signal } })
      .then(readResponse);
    expect(fetchMock.mock.calls[0][1]?.signal).toBe(controller.signal);
  });
  it("refreshes expired access tokens once for concurrent requests and replays them", async () => {
    let refreshes = 0;
    fetchMock.mockImplementation(async (url, init) => {
      if (String(url).includes("/auth/token")) {
        refreshes++;
        await Promise.resolve();
        return Response.json({
          accessToken: "new-token",
          user: { uid: "user", username: "tester" },
        });
      }
      return new Headers(init?.headers).get("Authorization") === "new-token"
        ? Response.json([])
        : problem("EXPIRED_TOKEN");
    });
    await Promise.all([
      rpc.api.quizzes.$get({ query: {} }).then(readResponse),
      rpc.api.quizzes.$get({ query: {} }).then(readResponse),
    ]);
    expect(refreshes).toBe(1);
    expect(storage.get("accessToken")).toBe("new-token");
  });
  it("keeps failed token refreshes finite and returns the original typed error", async () => {
    fetchMock.mockImplementation(async (url) =>
      String(url).includes("/auth/token")
        ? problem("INVAILD_TOKEN")
        : problem("EXPIRED_TOKEN"),
    );
    await expect(
      rpc.api.quizzes.$get({ query: {} }).then(readResponse),
    ).rejects.toMatchObject({ title: "EXPIRED_TOKEN" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("keeps authentication error codes available to the UI", async () => {
    fetchMock.mockResolvedValue(problem("REQUIRE_REREGISTRATION", 400));
    await expect(
      rpc.api.auth.login
        .$post({ json: { username: "tester", password: "password" } })
        .then(readResponse),
    ).rejects.toMatchObject({ title: "REQUIRE_REREGISTRATION" });
  });
  it("treats legacy HTTP 200 ranking text failures as errors", async () => {
    fetchMock.mockResolvedValue(
      new Response("An Error Occured", { status: 200 }),
    );
    await expect(
      rpc.api.analysis.ranking.all[":period"]
        .$get({ param: { period: "day" }, query: {} })
        .then(readJsonResponse),
    ).rejects.toMatchObject({ title: "HTTP_ERROR", status: 500 });
  });
});

it("restores optimistic query snapshots after a failed mutation and updates the matching size", () => {
  const client = new QueryClient();
  const params = { params: { query: { isFavorite: true } } };
  const key = ["get", "/quizzes", params];
  const sizeKey = ["get", "/quizzes/size", params];
  client.setQueryData(key, [{ qid: "q", isFavorite: true }]);
  client.setQueryData(sizeKey, { size: 1 });
  const snapshot = takeQuerySnapshot(client, QUIZZES_QUERY_KEY);
  client.setQueryData(key, []);
  updateRelatedQuizSize(client, key, -1);
  expect(client.getQueryData(sizeKey)).toEqual({ size: 0 });
  restoreQuerySnapshot(client, snapshot);
  expect(client.getQueryData(key)).toEqual([{ qid: "q", isFavorite: true }]);
  client.clear();
});

// These calls are compiled but never executed: input mistakes must be rejected by RPC types.
export function checkRpcInputTypes() {
  // @ts-expect-error question and answer are required
  rpc.api.quizzes.$post({ json: { question: "Q" } });
  // @ts-expect-error boolean filters are not arbitrary strings
  rpc.api.quizzes.$get({ query: { isFavorite: "false" } });
  // @ts-expect-error JSON password must be a string
  rpc.api.auth.login.$post({ json: { username: "tester", password: 123 } });
}
