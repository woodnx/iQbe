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
    since: 1792368000000,
    until: 1792454399999,
    judgements: [0],
    tags: ["a"],
  },
  navigate: vi.fn(),
  getQuizzes: vi.fn(),
  getQuizzesSize: vi.fn(),
  control: {} as {
    onSelectJudgement: (value: number[]) => void;
    onChangeDates: (dates: number[]) => void;
  },
  list: {} as { page: number; perPage: number },
}));
let client: QueryClient;
let unsubscribe: Array<() => void>;
vi.mock("@/utils/api", () => ({ api: mocks }));
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
    .mockResolvedValue([{ qid: "latest-quiz", judgement: 0 }]);
  mocks.getQuizzesSize.mockReset().mockResolvedValue({ size: 1 });
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

describe("latest quiz history", () => {
  it("explains latest-answer semantics and forwards identical period/judgement filters to list and count", async () => {
    expect(renderRoute()).toContain("各問題の最新の解答結果");
    await vi.waitFor(() => {
      expect(mocks.getQuizzes).toHaveBeenCalledTimes(1);
      expect(mocks.getQuizzesSize).toHaveBeenCalledTimes(1);
    });
    const listInput = mocks.getQuizzes.mock.calls[0][0];
    expect(listInput).toEqual(mocks.getQuizzesSize.mock.calls[0][0]);
    expect(listInput.params.query).toMatchObject({
      judgements: [0],
      tags: ["a"],
      page: 2,
    });
    expect(mocks.list).toMatchObject({ page: 2, perPage: 25 });
  });
  it("resets pagination when judgement or period changes", () => {
    renderRoute();
    mocks.control.onSelectJudgement([1]);
    const judgementNavigation = mocks.navigate.mock.calls[0][0];
    expect(judgementNavigation.to).toBe("/history");
    expect(judgementNavigation.search(mocks.search)).toMatchObject({
      page: 1,
      judgements: [1],
    });
    mocks.control.onChangeDates([1792454400000, 1792540799999]);
    const dateNavigation = mocks.navigate.mock.calls[1][0];
    expect(dateNavigation.search(mocks.search)).toMatchObject({
      page: 1,
      since: 1792454400000,
      until: 1792540799999,
    });
  });
});
