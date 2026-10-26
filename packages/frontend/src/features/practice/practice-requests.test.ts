import {
  QueryClient,
  QueryClientProvider,
  QueryObserver,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import QuizMylistButton from "@/features/quiz/components/QuizMylistButton";
import type { Quiz } from "@/utils/api-types";
import PracticeSceneChanger from "./components/PracticeSceneChanger";

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  mylists: vi.fn(),
  judge: undefined as
    | undefined
    | ((judgement: number, pressedWord: number) => void),
}));
let client: QueryClient;
let subscriptions: Array<() => void>;

vi.mock("@/utils/client", () => ({
  readResponse: (response: Response) => response.json(),
  rpc: {
    api: { practice: { $post: mocks.save }, mylists: { $get: mocks.mylists } },
  },
}));
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: (options: UseQueryOptions) => {
      const observer = new actual.QueryObserver(client, options);
      subscriptions.push(observer.subscribe(() => {}));
      return observer.getCurrentResult();
    },
  };
});
vi.mock("@tanstack/react-router", () => ({
  useSearch: () => ({ seed: 1 }),
  useRouter: () => ({ navigate: vi.fn() }),
}));
vi.mock("@mantine/core", () => {
  const Container = ({ children }: { children?: ReactNode }) =>
    createElement("div", null, children);
  return {
    Group: Container,
    Loader: Container,
    Overlay: Container,
    Text: Container,
    ActionIcon: Container,
    Button: Container,
    Checkbox: Container,
    Divider: Container,
    Menu: Object.assign(Container, {
      Target: Container,
      Dropdown: Container,
      Item: Container,
    }),
  };
});
vi.mock("@mantine/modals", () => ({ modals: { openContextModal: vi.fn() } }));
vi.mock("@mantine/notifications", () => ({ notifications: { show: vi.fn() } }));
vi.mock("@mantine/hooks", () => ({
  useDisclosure: () => [false, { open: vi.fn(), close: vi.fn() }],
}));
vi.mock("@/contexts/isMobile", () => ({ useIsMobile: () => false }));
vi.mock("@/hooks", () => ({ useTimer: () => ({ start: vi.fn() }) }));
vi.mock("@/features/filtering/components/FilteringModal", () => ({
  default: () => null,
}));
vi.mock("@/features/filtering/components/FilteringModalButton", () => ({
  default: () => null,
}));
vi.mock("./components/PracticeQuitModal", () => ({ default: () => null }));
vi.mock("./components/PracticeResultModal", () => ({ default: () => null }));
vi.mock("./components/PracticeQuizIntro", () => ({
  PracticeQuizIntro: () => null,
}));
vi.mock("./components/PracticeQuizController", () => ({
  PracticeQuizController: ({ onJudge }: { onJudge: typeof mocks.judge }) => {
    mocks.judge = onJudge;
    return null;
  },
}));

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  subscriptions = [];
  mocks.save.mockReset().mockResolvedValue(Response.json({}));
  mocks.mylists.mockReset().mockImplementation(async () => Response.json([]));
});
afterEach(() => {
  subscriptions.forEach((stop) => stop());
  client.clear();
});
const render = (node: ReactNode) =>
  renderToString(createElement(QueryClientProvider, { client }, node));

it.each([false, true])(
  "saves a judgement without refetching the active quiz list (failure=%s)",
  async (failure) => {
    const quizzes = [
      { qid: "q1", total: 0, right: 0, judgement: null },
    ] as unknown as Quiz[];
    const queryKey = ["get", "/quizzes", { params: { query: { seed: 1 } } }];
    const fetchQuizzes = vi.fn().mockResolvedValue(quizzes);
    const observer = new QueryObserver(client, {
      queryKey,
      queryFn: fetchQuizzes,
    });
    subscriptions.push(observer.subscribe(() => {}));
    await vi.waitFor(() =>
      expect(client.getQueryData(queryKey)).toEqual(quizzes),
    );
    if (failure) mocks.save.mockRejectedValue(new Error("save failed"));
    render(
      createElement(PracticeSceneChanger, {
        quizzes,
        size: 1,
        shuffledList: [0],
      }),
    );
    mocks.judge!(1, 5);
    await vi.waitFor(() => {
      expect(mocks.save).toHaveBeenCalledWith({
        json: { qid: "q1", judgement: 1, pressedWord: 5 },
      });
      expect(client.isMutating()).toBe(0);
    });
    expect(fetchQuizzes).toHaveBeenCalledTimes(1);
    expect(client.getQueryState(queryKey)?.isInvalidated).toBe(true);
    expect(client.getQueryData(queryKey)).toEqual(
      failure ? quizzes : [{ qid: "q1", total: 1, right: 1, judgement: 1 }],
    );
    // A later visit still refreshes invalidated data.
    const nextVisit = new QueryObserver(client, {
      queryKey,
      queryFn: fetchQuizzes,
    });
    subscriptions.push(nextVisit.subscribe(() => {}));
    await vi.waitFor(() => expect(fetchQuizzes).toHaveBeenCalledTimes(2));
  },
);

it("reuses mylists when the next question mounts, while allowing invalidation to refresh them", async () => {
  render(createElement(QuizMylistButton, { qid: "q1", registerdMylists: [] }));
  await vi.waitFor(() =>
    expect(client.getQueryData(["get", "/mylists"])).toEqual([]),
  );
  subscriptions.splice(0).forEach((stop) => stop());
  render(createElement(QuizMylistButton, { qid: "q2", registerdMylists: [] }));
  expect(mocks.mylists).toHaveBeenCalledTimes(1);
  await client.invalidateQueries({ queryKey: ["get", "/mylists"] });
  expect(mocks.mylists).toHaveBeenCalledTimes(2);
});
