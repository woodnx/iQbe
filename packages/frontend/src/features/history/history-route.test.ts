import type { UseQueryOptions } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route } from "@/routes/history";

const mocks = vi.hoisted(() => ({
  search: {
    page: 2,
    maxView: 25,
    since: "2026-10-19T00:00:00.000Z",
    until: "2026-10-19T23:59:59.999Z",
    judgements: ["wrong"],
    tags: ["a"],
  },
  navigate: vi.fn(),
  getQuizzes: vi.fn(),
  getQuizzesSize: vi.fn(),
  control: {} as {
    onSelectJudgement: (value: import("@/types").Judgement[]) => void;
    onChangeDates: (dates: string[]) => void;
  },
  list: {} as {
    page: number;
    perPage: number;
    quizzes?: { qid: string; judgement: number }[];
  },
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
  useRouter: () => ({ navigate: mocks.navigate }),
}));
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
vi.mock("@mantine/core", () => ({
  Group: ({ children }: { children: ReactNode }) =>
    createElement("div", null, children),
  Text: ({ children }: { children: ReactNode }) =>
    createElement("p", null, children),
}));
vi.mock("@/hooks/useHistories", () => ({
  useHistories: () => ({ histories: null }),
}));
vi.mock("@/features/quiz/components/QuizControllBar", () => ({
  default: (props: typeof mocks.control) => {
    mocks.control = props;
    return null;
  },
}));
vi.mock("@/features/quiz/components/QuizList", () => ({
  default: (props: typeof mocks.list) => {
    mocks.list = props;
    return null;
  },
}));
vi.mock("@/features/filtering/components/FilteringModalButton", () => ({
  default: () => null,
}));
vi.mock("@/features/quiz/components/QuizHiddenAnswerButton", () => ({
  default: () => null,
}));
vi.mock("@/features/quiz/components/QuizShuffleButton", () => ({
  default: () => null,
}));
vi.mock("@/features/quiz/components/QuizTransfarButton", () => ({
  default: () => null,
}));

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  unsubscribe = [];
  mocks.navigate.mockReset();
  mocks.getQuizzes
    .mockReset()
    .mockImplementation(async () =>
      Response.json([{ qid: "latest-quiz", judgement: 0 }]),
    );
  mocks.getQuizzesSize
    .mockReset()
    .mockImplementation(async () => Response.json({ size: 1 }));
});
afterEach(() => {
  unsubscribe.forEach((stop) => stop());
  client.clear();
});
const renderRoute = () =>
  renderToString(
    createElement(
      Route.options.component as () => ReturnType<typeof createElement>,
    ),
  );

describe("quiz attempt history", () => {
  it("passes repeated attempts and their individual judgements to the list", async () => {
    const attempts = [
      { qid: "same-quiz", judgement: 1 },
      { qid: "same-quiz", judgement: 0 },
    ];
    mocks.getQuizzes.mockImplementation(async () => Response.json(attempts));
    renderRoute();
    await vi.waitFor(() => {
      renderRoute();
      expect(mocks.list.quizzes).toEqual(attempts);
    });
  });
  it("forwards identical ISO period and named judgement filters to list and count", async () => {
    renderRoute();
    await vi.waitFor(() => {
      expect(mocks.getQuizzes).toHaveBeenCalledTimes(1);
      expect(mocks.getQuizzesSize).toHaveBeenCalledTimes(1);
    });
    const listInput = mocks.getQuizzes.mock.calls[0][0];
    expect(listInput).toEqual(mocks.getQuizzesSize.mock.calls[0][0]);
    expect(listInput.query).toMatchObject({
      history: true,
      judgements: ["wrong"],
      tags: ["a"],
      since: mocks.search.since,
      until: mocks.search.until,
      page: 2,
    });
    expect(mocks.list).toMatchObject({ page: 2, perPage: 25 });
  });
  it("resets pagination when judgement or period changes", () => {
    renderRoute();
    mocks.control.onSelectJudgement(["right"]);
    const judgementNavigation = mocks.navigate.mock.calls[0][0];
    expect(judgementNavigation.to).toBe("/history");
    expect(judgementNavigation.search(mocks.search)).toMatchObject({
      page: 1,
      judgements: ["right"],
    });
    mocks.control.onChangeDates([
      "2026-10-20T00:00:00.000Z",
      "2026-10-20T23:59:59.999Z",
    ]);
    const dateNavigation = mocks.navigate.mock.calls[1][0];
    expect(dateNavigation.search(mocks.search)).toMatchObject({
      page: 1,
      since: "2026-10-20T00:00:00.000Z",
      until: "2026-10-20T23:59:59.999Z",
    });
  });
});
