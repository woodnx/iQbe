import { MantineProvider } from "@mantine/core";
import { createElement, type ComponentProps } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import HistoryDateRange from "@/features/history/components/HistoryDateRange";
import HistorySelectJudgement from "@/features/history/components/HistorySelectJudgement";
import QuizControllBar from "./QuizControllBar";

vi.mock("@/features/history/components/HistoryDateRange", () => ({
  default: vi.fn(() => null),
}));
vi.mock("@/features/history/components/HistorySelectJudgement", () => ({
  default: vi.fn(() => null),
}));
vi.mock("./QuizPagination", () => ({ default: () => null }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

const renderControl = (props: ComponentProps<typeof QuizControllBar>) =>
  renderToString(
    createElement(MantineProvider, null, createElement(QuizControllBar, props)),
  );

const commonProps = {
  total: 10,
  buttons: null,
  activePage: 1,
  maxView: 25,
  setPage: vi.fn(),
  id: "quiz-controls",
  pb: "sm",
};

it("keeps history filters off the DOM and forwards them to their controls", () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  const dates = ["2026-10-28T00:00:00.000Z", "2026-10-28T23:59:59.999Z"];
  const onChangeDates = vi.fn();
  const onSelectJudgement = vi.fn();
  const html = renderControl({
    ...commonProps,
    variant: "history",
    judgements: ["wrong"],
    right: 1,
    wrong: 2,
    throgh: 3,
    dates,
    onChangeDates,
    onSelectJudgement,
  });

  expect(error).not.toHaveBeenCalled();
  expect(html).toContain('id="quiz-controls"');
  expect(html).toContain("padding-bottom:");
  expect(html).not.toContain(";right:");
  for (const prop of ["judgements", "right", "wrong", "throgh", "dates"]) {
    expect(html).not.toContain(` ${prop}=`);
  }
  expect(vi.mocked(HistoryDateRange).mock.calls[0][0]).toEqual({
    dates,
    onChangeDates,
  });
  expect(vi.mocked(HistorySelectJudgement).mock.calls[0][0]).toEqual({
    judgements: ["wrong"],
    right: 1,
    wrong: 2,
    throgh: 3,
    onSelect: onSelectJudgement,
  });
});

it("preserves Stack props without history filters in pagination mode", () => {
  const html = renderControl({ ...commonProps, variant: "onlyPagenation" });

  expect(html).toContain('id="quiz-controls"');
  expect(html).toContain("padding-bottom:");
  expect(HistoryDateRange).not.toHaveBeenCalled();
  expect(HistorySelectJudgement).not.toHaveBeenCalled();
});
