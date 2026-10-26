import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { ApiClientError } from "./client";
import {
  takeQuerySnapshot,
  restoreQuerySnapshot,
  updateRelatedQuizSize,
  QUIZZES_QUERY_KEY,
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
    await api.getQuizzes({
      params: {
        query: {
          wids: ["a", "b"],
          isFavorite: false,
          tagMatchAll: false,
          seed: 0,
          keyword: null,
        },
      },
    });
    const [url, init] = fetchMock.mock.calls[0];
    const params = new URL(String(url), "http://localhost").searchParams;
    expect(params.getAll("wids")).toEqual(["a", "b"]);
    expect(params.get("isFavorite")).toBe("false");
    expect(params.get("tagMatchAll")).toBe("false");
    expect(params.get("seed")).toBe("0");
    expect(params.has("keyword")).toBe(false);
    expect(new Headers(init?.headers).get("Authorization")).toBe("old-token");
  });
  it("throws a typed HTTP error for React Query mutations", async () => {
    fetchMock.mockImplementation(async () => problem("ACCESS_DENIED", 403));
    await expect(api.postLike({ body: { qid: "q" } })).rejects.toMatchObject({
      title: "ACCESS_DENIED",
      status: 403,
    });
    await expect(api.postLike({ body: { qid: "q" } })).rejects.toBeInstanceOf(
      ApiClientError,
    );
  });
  it("handles empty success bodies without trying to parse JSON", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    expect(
      await api.deleteQuizzesQid({ params: { path: { qid: "q" } } }),
    ).toBeUndefined();
  });
  it("uploads multipart files without forcing a JSON content type", async () => {
    fetchMock.mockResolvedValue(
      Response.json([{ question: "Q", answer: "A", anotherAnswer: "" }]),
    );
    const file = new File(["question,answer\nQ,A"], "quiz.csv", {
      type: "text/csv",
    });
    await api.postCsvParse({ body: { file } });
    const [, init] = fetchMock.mock.calls[0];
    expect(init?.body).toBeInstanceOf(FormData);
    expect((init?.body as FormData).get("file")).toBe(file);
    expect(new Headers(init?.headers).has("Content-Type")).toBe(false);
  });
  it("passes AbortSignal through to fetch", async () => {
    fetchMock.mockResolvedValue(Response.json([]));
    const controller = new AbortController();
    await api.getQuizzes({}, controller.signal);
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
    await Promise.all([api.getQuizzes(), api.getQuizzes()]);
    expect(refreshes).toBe(1);
    expect(storage.get("accessToken")).toBe("new-token");
  });
  it("keeps failed token refreshes finite and returns the original typed error", async () => {
    fetchMock.mockImplementation(async (url) =>
      String(url).includes("/auth/token")
        ? problem("INVAILD_TOKEN")
        : problem("EXPIRED_TOKEN"),
    );
    await expect(api.getQuizzes()).rejects.toMatchObject({
      title: "EXPIRED_TOKEN",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("keeps authentication error codes available to the UI", async () => {
    fetchMock.mockResolvedValue(problem("REQUIRE_REREGISTRATION", 400));
    await expect(
      api.postAuthLogin({ body: { username: "tester", password: "password" } }),
    ).rejects.toMatchObject({ title: "REQUIRE_REREGISTRATION" });
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
  api.postQuizzes({ body: { question: "Q" } });
  // @ts-expect-error boolean filters are not arbitrary strings
  api.getQuizzes({ params: { query: { isFavorite: "false" } } });
  // @ts-expect-error JSON password must be a string
  api.postAuthLogin({ body: { username: "tester", password: 123 } });
}
