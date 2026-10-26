import type { UseQueryOptions } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route } from "@/routes/practice";

const mocks = vi.hoisted(() => ({
  search: {} as { isTransfer?: boolean; keyword?: string; seed?: number },
  scene: vi.fn(),
  getQuizzes: vi.fn(),
  getQuizzesSize: vi.fn(),
}));
let client: QueryClient;
let unsubscribe: Array<() => void>;

vi.mock("@/utils/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils/client")>()),
  rpc: {
    api: {
      quizzes: { $get: mocks.getQuizzes, size: { $get: mocks.getQuizzesSize } },
    },
  },
}));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: object) => ({ options }),
  useSearch: () => mocks.search,
}));
vi.mock("@/features/practice/components/PracticeSceneChanger", () => ({
  default: (props: unknown) => {
    mocks.scene(props);
    return null;
  },
}));
// Subscribe to the actual query observers to exercise fetch enablement without a DOM.
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: (options: UseQueryOptions) => {
      const observer = new actual.QueryObserver(client, options);
      unsubscribe.push(observer.subscribe(() => {}));
      return observer.getCurrentResult();
    },
  };
});

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  unsubscribe = [];
  mocks.search = {};
  mocks.getQuizzes
    .mockReset()
    .mockImplementation(async () => Response.json([{ qid: "q1" }]));
  mocks.getQuizzesSize
    .mockReset()
    .mockImplementation(async () => Response.json({ size: 1 }));
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => {
  unsubscribe.forEach((stop) => stop());
  client.clear();
  vi.restoreAllMocks();
});

const renderRoute = () =>
  renderToString(
    createElement(
      Route.options.component as () => ReturnType<typeof createElement>,
    ),
  );

describe("practice data loading", () => {
  it("loads quizzes and their size when transferred, even with an empty cache", async () => {
    mocks.search = { isTransfer: true, keyword: "test" };
    renderRoute();
    await vi.waitFor(() => {
      expect(mocks.getQuizzes).toHaveBeenCalledTimes(1);
      expect(mocks.getQuizzesSize).toHaveBeenCalledTimes(1);
      expect(
        client.getQueryData([
          "get",
          "/quizzes",
          { params: { query: mocks.search } },
        ]),
      ).toEqual([{ qid: "q1" }]);
    });
  });
  it.each([0, 12345])(
    "reloads a seeded practice in the same API order (seed %s)",
    async (seed) => {
      mocks.search = { seed, isTransfer: true };
      const quizzes = [{ qid: "q3" }, { qid: "q1" }, { qid: "q2" }];
      mocks.getQuizzes.mockImplementation(async () => Response.json(quizzes));
      renderRoute();
      await vi.waitFor(() =>
        expect(
          client.getQueryData([
            "get",
            "/quizzes",
            { params: { query: mocks.search } },
          ]),
        ).toEqual(quizzes),
      );
      renderRoute();
      expect(mocks.scene).toHaveBeenLastCalledWith(
        expect.objectContaining({
          quizzes,
          shuffledList: [0, 1, 2],
        }),
      );
      client.clear();
      mocks.search = { seed };
      renderRoute();
      await vi.waitFor(() =>
        expect(
          client.getQueryData([
            "get",
            "/quizzes",
            { params: { query: mocks.search } },
          ]),
        ).toEqual(quizzes),
      );
      renderRoute();
      expect(mocks.scene).toHaveBeenLastCalledWith(
        expect.objectContaining({
          quizzes,
          shuffledList: [0, 1, 2],
        }),
      );
    },
  );
  it("waits for filtering on an ordinary visit", () => {
    mocks.search = { isTransfer: false };
    renderRoute();
    expect(mocks.getQuizzes).not.toHaveBeenCalled();
    expect(mocks.getQuizzesSize).not.toHaveBeenCalled();
  });
});
