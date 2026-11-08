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
  updateSession: vi.fn(),
  mylists: vi.fn(),
  notify: vi.fn(),
  navigate: vi.fn(),
  retry: undefined as undefined | (() => Promise<void>),
  quit: undefined as undefined | ((judgement: number) => Promise<void>),
  judge: undefined as
    | undefined
    | ((judgement: number, pressedWord: number) => Promise<void>),
}));
let client: QueryClient;
let subscriptions: Array<() => void>;

vi.mock("@/plugins/db", () => ({
  db: { practiceSessions: { update: mocks.updateSession } },
}));

vi.mock("@/utils/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils/client")>()),
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
  useRouter: () => ({ navigate: mocks.navigate }),
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
vi.mock("@mantine/notifications", () => ({
  notifications: { show: mocks.notify },
}));
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
vi.mock("./components/PracticeQuitModal", () => ({
  default: ({ onJudge }: { onJudge: typeof mocks.quit }) => {
    mocks.quit = onJudge;
    return null;
  },
}));
vi.mock("./components/PracticeSaveStatus", () => ({
  PracticeSaveStatus: ({ onRetry }: { onRetry: typeof mocks.retry }) => {
    mocks.retry = onRetry;
    return null;
  },
}));
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
  mocks.updateSession.mockReset().mockResolvedValue(1);
  mocks.save
    .mockReset()
    .mockImplementation(async () => new Response(null, { status: 200 }));
  mocks.notify.mockReset();
  mocks.navigate.mockReset().mockResolvedValue(undefined);
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
        initialIndex: 0,
        resumeId: 42,
      }),
    );
    await mocks.judge!(1, 5);
    await vi.waitFor(() => {
      expect(mocks.save).toHaveBeenCalledWith({
        json: {
          qid: "q1",
          judgement: 1,
          pressedWord: 5,
          clientAttemptId: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          ),
        },
      });
      expect(client.isMutating()).toBe(0);
    });
    if (failure) {
      expect(mocks.updateSession).not.toHaveBeenCalled();
      expect(mocks.notify).toHaveBeenCalledWith(
        expect.objectContaining({ color: "red" }),
      );
    } else {
      expect(mocks.updateSession).toHaveBeenCalledWith(42, {
        currentIndex: 1,
        updatedAt: expect.any(Date),
      });
      expect(mocks.notify).not.toHaveBeenCalled();
    }
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

const renderPractice = () => {
  const quizzes = [
    { qid: "q1", total: 0, right: 0, judgement: null },
  ] as unknown as Quiz[];
  const queryKey = ["get", "/quizzes", { params: { query: { seed: 1 } } }];
  client.setQueryData(queryKey, quizzes);
  render(
    createElement(PracticeSceneChanger, {
      quizzes,
      size: 1,
      shuffledList: [0],
      initialIndex: 0,
      resumeId: 42,
    }),
  );
  return {
    judge: mocks.judge!,
    quit: mocks.quit!,
    retry: mocks.retry!,
    queryKey,
  };
};

it("keeps the original ID and answer when retrying an uncertain save", async () => {
  // The server may have committed before the connection was lost.
  mocks.save.mockRejectedValueOnce(new Error("response lost"));
  const { judge, quit, retry, queryKey } = renderPractice();
  await judge(1, 5);
  expect(mocks.save).toHaveBeenCalledTimes(1);
  const original = mocks.save.mock.calls[0][0];
  expect(mocks.updateSession).not.toHaveBeenCalled();
  expect(client.getQueryData(queryKey)).toEqual([
    { qid: "q1", total: 0, right: 0, judgement: null },
  ]);
  // A different judgement or exit action cannot replace the unresolved answer.
  await judge(0, 9);
  await quit(0);
  expect(mocks.save).toHaveBeenCalledTimes(1);
  await retry();
  expect(mocks.save).toHaveBeenCalledTimes(2);
  expect(mocks.save.mock.calls[1][0]).toEqual(original);
  expect(mocks.updateSession).toHaveBeenCalledTimes(1);
  expect(mocks.navigate).not.toHaveBeenCalled();
  expect(client.getQueryData(queryKey)).toEqual([
    { qid: "q1", total: 1, right: 1, judgement: 1 },
  ]);
  await retry();
  expect(mocks.save).toHaveBeenCalledTimes(2);
});

it("ignores concurrent answer, retry and quit actions until progress is saved", async () => {
  let finishSave!: (response: Response) => void;
  let finishProgress!: (count: number) => void;
  mocks.save.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        finishSave = resolve;
      }),
  );
  mocks.updateSession.mockImplementationOnce(
    () =>
      new Promise<number>((resolve) => {
        finishProgress = resolve;
      }),
  );
  const { judge, quit, retry } = renderPractice();
  const saving = judge(1, 5);
  await judge(0, 9);
  await quit(0);
  await retry();
  await vi.waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
  expect(mocks.updateSession).not.toHaveBeenCalled();
  finishSave(new Response(null, { status: 200 }));
  await vi.waitFor(() => expect(mocks.updateSession).toHaveBeenCalledTimes(1));
  await quit(2);
  await retry();
  expect(mocks.save).toHaveBeenCalledTimes(1);
  expect(mocks.navigate).not.toHaveBeenCalled();
  finishProgress(1);
  await saving;
});

it("retries a failed quit with the original answer and navigates only on success", async () => {
  mocks.save.mockRejectedValueOnce(new Error("offline"));
  const { quit, judge, retry } = renderPractice();
  await quit(2);
  const original = mocks.save.mock.calls[0][0];
  expect(original.json).toMatchObject({ judgement: 2, pressedWord: -1 });
  expect(mocks.navigate).not.toHaveBeenCalled();
  expect(mocks.notify).toHaveBeenCalledOnce();
  await judge(1, 10);
  await retry();
  expect(mocks.save).toHaveBeenCalledTimes(2);
  expect(mocks.save.mock.calls[1][0]).toEqual(original);
  expect(mocks.navigate).toHaveBeenCalledExactlyOnceWith({ to: "/" });
  expect(mocks.updateSession).not.toHaveBeenCalled();
});

it("retries local progress without resending or recounting an already saved answer", async () => {
  mocks.updateSession.mockRejectedValueOnce(new Error("IndexedDB failed"));
  const { judge, retry, queryKey } = renderPractice();
  await judge(1, 0);
  expect(mocks.notify).toHaveBeenCalledWith(
    expect.objectContaining({
      message: expect.stringContaining("解答は保存済み"),
    }),
  );
  await retry();
  expect(mocks.save).toHaveBeenCalledTimes(1);
  expect(mocks.updateSession).toHaveBeenCalledTimes(2);
  expect(client.getQueryData(queryKey)).toEqual([
    { qid: "q1", total: 1, right: 1, judgement: 1 },
  ]);
});

it("handles HTTP errors without advancing or losing the pending answer", async () => {
  mocks.save.mockImplementationOnce(async () =>
    Response.json({ code: "CLIENT_ATTEMPT_ID_CONFLICT" }, { status: 409 }),
  );
  const { judge, quit } = renderPractice();
  await expect(judge(1, 0)).resolves.toBeUndefined();
  expect(mocks.notify).toHaveBeenCalledOnce();
  expect(mocks.updateSession).not.toHaveBeenCalled();
  await quit(0);
  expect(mocks.save).toHaveBeenCalledTimes(1);
});

it("uses a new ID when the same question is attempted in a new practice", async () => {
  await renderPractice().judge(1, 5);
  await renderPractice().judge(1, 5);
  const [first, second] = mocks.save.mock.calls.map(([input]) => input.json);
  expect(first.clientAttemptId).not.toBe(second.clientAttemptId);
});
