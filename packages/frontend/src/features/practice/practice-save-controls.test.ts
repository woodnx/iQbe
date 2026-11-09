import { createElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import FilteringModalButton from "@/features/filtering/components/FilteringModalButton";
import type { Quiz } from "@/utils/api-types";
import PracticeQuitModal from "./components/PracticeQuitModal";
import { PracticeQuizController } from "./components/PracticeQuizController";
import { PracticeSaveStatus } from "./components/PracticeSaveStatus";

const mocks = vi.hoisted(() => ({
  mobile: false,
  buttons: [] as Array<{
    children?: ReactNode;
    disabled?: boolean;
    onClick?: () => void;
  }>,
  openFilter: vi.fn(),
}));
vi.mock("@mantine/core", () => {
  const Container = ({ children }: { children?: ReactNode }) =>
    createElement("div", null, children);
  const Button = (props: {
    children?: ReactNode;
    disabled?: boolean;
    onClick?: () => void;
  }) => {
    mocks.buttons.push(props);
    return createElement(
      "button",
      { disabled: props.disabled },
      props.children,
    );
  };
  return {
    Affix: Container,
    Alert: Container,
    Paper: Container,
    Group: Container,
    Loader: Container,
    Text: Container,
    Card: Container,
    Center: Container,
    Modal: Container,
    Space: Container,
    Stack: Container,
    Button,
    ActionIcon: Button,
  };
});
vi.mock("@mantine/hooks", () => ({
  useDisclosure: () => [true, { open: vi.fn(), close: vi.fn() }],
}));
vi.mock("@mantine/modals", () => ({
  modals: { openContextModal: mocks.openFilter },
}));
vi.mock("@/contexts/isMobile", () => ({ useIsMobile: () => mocks.mobile }));
vi.mock("./components/PracticeTypewriteQuiz", () => ({
  PracticeTypewriteQuiz: () => null,
}));
vi.mock("./components/PracticeQuizInfo", () => ({
  PracticeQuizInfo: () => null,
}));
vi.mock("./components/PracticeQuizButton", () => ({
  PracticeQuizButton: (props: { disabled?: boolean; onClick?: () => void }) => {
    mocks.buttons.push(props);
    return createElement("button", { disabled: props.disabled });
  },
}));

beforeEach(() => {
  mocks.buttons = [];
  mocks.mobile = false;
  mocks.openFilter.mockClear();
});

it("shows a retry action after a failure, and no retry while saving", () => {
  const retry = vi.fn();
  expect(
    renderToString(
      createElement(PracticeSaveStatus, { state: "idle", onRetry: retry }),
    ),
  ).toBe("");
  expect(
    renderToString(
      createElement(PracticeSaveStatus, { state: "saving", onRetry: retry }),
    ),
  ).toContain("保存しています");
  expect(mocks.buttons).toHaveLength(0);
  const failed = renderToString(
    createElement(PracticeSaveStatus, { state: "failed", onRetry: retry }),
  );
  expect(failed).toContain("もう一度保存する");
  expect(failed).toContain("解答を保持しています");
  expect(mocks.buttons).toHaveLength(1);
  expect(mocks.buttons[0].disabled).not.toBe(true);
  mocks.buttons[0].onClick!();
  expect(retry).toHaveBeenCalledOnce();
});

it("disables all quiz recording controls while a save is unresolved", () => {
  const judge = vi.fn();
  renderToString(
    createElement(PracticeQuizController, {
      quiz: { qid: "q1", question: "Question", answer: "Answer" } as Quiz,
      scene: "quizzing",
      ignoreLimit: 3000,
      countLimit: 5000,
      disabled: true,
      onJudge: judge,
    }),
  );
  expect(mocks.buttons).toHaveLength(4);
  expect(mocks.buttons.every((button) => button.disabled)).toBe(true);
  mocks.buttons.forEach((button) => button.onClick?.());
  expect(judge).not.toHaveBeenCalled();
});

it.each([false, true])(
  "disables exit recording and filtering on mobile=%s",
  (mobile) => {
    mocks.mobile = mobile;
    const judge = vi.fn();
    renderToString(
      createElement(PracticeQuitModal, { disabled: true, onJudge: judge }),
    );
    const recording = mocks.buttons.filter(
      (button) => button.children !== "クイズに戻る",
    );
    expect(recording).toHaveLength(4);
    expect(recording.every((button) => button.disabled)).toBe(true);
    recording.forEach((button) => button.onClick?.());
    expect(judge).not.toHaveBeenCalled();
    mocks.buttons = [];
    renderToString(createElement(FilteringModalButton, { disabled: true }));
    expect(mocks.buttons).toHaveLength(1);
    expect(mocks.buttons[0].disabled).toBe(true);
    mocks.buttons[0].onClick!();
    expect(mocks.openFilter).not.toHaveBeenCalled();
  },
);
