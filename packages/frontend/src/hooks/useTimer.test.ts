import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import { useTimer } from "./useTimer";

const mocks = vi.hoisted(() => ({
  tick: undefined as (() => void) | undefined,
  updates: [] as Array<{ initial: unknown; update: unknown }>,
}));

vi.mock("./useInterval", () => ({
  useInterval: (callback: () => void) => {
    mocks.tick = callback;
  },
}));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useState: (initial: unknown) => {
      const [value] = actual.useState(initial);
      return [
        value,
        (update: unknown) => mocks.updates.push({ initial, update }),
      ];
    },
  };
});

beforeEach(() => {
  mocks.tick = undefined;
  mocks.updates = [];
});

it.each([
  [200, 100, 100, false],
  [100, 100, 0, true],
  [50, 100, 0, true],
])(
  "ticks from %i by %i without running completion inside a state updater",
  (initialTime, interval, expectedTime, completed) => {
    const onComplete = vi.fn();
    function Timer() {
      useTimer(initialTime, interval, onComplete);
      return null;
    }
    renderToString(createElement(Timer));
    mocks.tick!();

    expect(onComplete).toHaveBeenCalledTimes(completed ? 1 : 0);
    const timeUpdate = mocks.updates[0];
    expect(timeUpdate.initial).toBe(initialTime);
    expect(timeUpdate.update).toBe(expectedTime);
    // React can replay updater functions during render. Completion must
    // already have happened in the interval event, outside those functions.
    for (const { initial, update } of mocks.updates) {
      if (typeof update === "function") {
        update(initial);
        update(initial);
      }
    }
    expect(onComplete).toHaveBeenCalledTimes(completed ? 1 : 0);
  },
);
