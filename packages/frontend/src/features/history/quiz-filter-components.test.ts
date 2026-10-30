import { createElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import { PracticeSettingModal } from "@/features/practice/components/PracticeSettingModal";
import HistorySelectJudgement from "./components/HistorySelectJudgement";

const controls = vi.hoisted(() => ({
  start: undefined as undefined | (() => void),
  checks: [] as string[],
  selected: [] as { label: string; isSelect: boolean; onClick: () => void }[],
}));
vi.mock("@mantine/core", () => {
  const Container = ({ children }: { children?: ReactNode }) =>
    createElement("div", null, children);
  const Checkbox = Object.assign(
    ({ value }: { value?: string }) => {
      if (value) controls.checks.push(value);
      return null;
    },
    { Group: Container },
  );
  return {
    Checkbox,
    Stack: Container,
    Divider: () => null,
    Button: ({ onClick }: { onClick: () => void }) => {
      controls.start = onClick;
      return null;
    },
  };
});
vi.mock("./components/HistorySelectButton", () => ({
  default: (props: (typeof controls.selected)[number]) => {
    controls.selected.push(props);
    return null;
  },
}));
beforeEach(() => {
  controls.start = undefined;
  controls.checks = [];
  controls.selected = [];
});
it.each([true, false])(
  "emits named practice filters with unanswered enabled=%s",
  (isContainNA) => {
    const onTrain = vi.fn();
    const closeModal = vi.fn();
    renderToString(
      createElement(PracticeSettingModal, {
        id: "practice",
        context: { closeModal } as never,
        innerProps: { isContainNA, onTrain },
      }),
    );
    controls.start!();
    const expected = isContainNA
      ? ["wrong", "right", "through", "unanswered"]
      : ["wrong", "right", "through"];
    expect(onTrain).toHaveBeenCalledWith(expected);
    expect(controls.checks.sort()).toEqual([...expected].sort());
    expect(closeModal).toHaveBeenCalledWith("practice");
  },
);
it("selects and deselects history filters using names", () => {
  const onSelect = vi.fn();
  renderToString(
    createElement(HistorySelectJudgement, {
      judgements: ["wrong"],
      right: 1,
      wrong: 2,
      throgh: 3,
      onSelect,
    }),
  );
  expect(controls.selected.map((item) => item.isSelect)).toEqual([
    false,
    true,
    false,
  ]);
  controls.selected[0].onClick();
  expect(onSelect).toHaveBeenLastCalledWith(["wrong", "right"]);
  controls.selected[1].onClick();
  expect(onSelect).toHaveBeenLastCalledWith([]);
  controls.selected[2].onClick();
  expect(onSelect).toHaveBeenLastCalledWith(["wrong", "through"]);
});
