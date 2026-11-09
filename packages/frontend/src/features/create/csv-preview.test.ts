import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import type { Element } from "@/routes/create";
import type { Category } from "@/utils/api-types";
import CsvEditor from "./components/CsvEditor";

type ButtonProps = {
  children?: ReactNode;
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
};
type SelectProps = {
  "aria-label": string;
  value: string | null;
  disabled?: boolean;
  data: { value: string; label: string }[];
  onChange: (value: string | null) => void;
};
const mocks = vi.hoisted(() => ({
  buttons: [] as ButtonProps[],
  selects: [] as SelectProps[],
  categories: [] as Category[],
  open: vi.fn(),
  close: vi.fn(),
}));
vi.mock("@mantine/core", () => {
  const Container = ({ children }: { children?: ReactNode }) =>
    createElement("div", null, children);
  return {
    Alert: Container,
    Divider: Container,
    Group: Container,
    Modal: Container,
    Text: Container,
    Title: Container,
    ScrollArea: Container,
    Table: Object.assign(Container, {
      Tr: Container,
      Td: Container,
      Th: Container,
      Thead: Container,
      Tbody: Container,
      ScrollContainer: Container,
    }),
    Button: (props: ButtonProps) => {
      mocks.buttons.push(props);
      return createElement(
        "button",
        { disabled: props.disabled },
        props.children,
      );
    },
    Select: (props: SelectProps) => {
      mocks.selects.push(props);
      return createElement("input", {
        "aria-label": props["aria-label"],
        disabled: props.disabled,
        value: props.value ?? "",
        readOnly: true,
      });
    },
  };
});
vi.mock("@mantine/hooks", () => ({
  useDisclosure: () => [true, { open: mocks.open, close: mocks.close }],
}));
vi.mock("@/hooks/useCategories", () => ({
  useCategories: () => ({ categories: mocks.categories, isLoading: false }),
}));
vi.mock("@/features/workbook/components/WorkbookCreateAndSelector", () => ({
  default: () => null,
}));

const category = (id: number, name: string, parentId = -1): Category => ({
  id,
  name,
  parentId,
  disabled: false,
  description: null,
});
const unresolved = (): Element => ({
  question: "Q",
  answer: "A",
  anotherAnswer: "別解",
  categoryName: "科学",
  subCategoryName: "未知",
  categoryError: "小ジャンルを特定できません。",
});
const button = (label: string) =>
  mocks.buttons.find((entry) => entry.children === label)!;
const select = (label: string) =>
  mocks.selects.find((entry) => entry["aria-label"] === label)!;
function setup(initial: Element[]) {
  let rows = initial;
  const onSave = vi
    .fn<(_: Element[], wid: string | null) => Promise<void>>()
    .mockResolvedValue();
  const onReload = vi.fn();
  const render = () => {
    mocks.buttons = [];
    mocks.selects = [];
    return renderToStaticMarkup(
      createElement(CsvEditor, {
        elements: rows,
        onChange: (updated) => {
          rows = updated;
        },
        onSave,
        onReload,
      }),
    );
  };
  return { render, onSave, onReload, rows: () => rows };
}
beforeEach(() => {
  mocks.open.mockClear();
  mocks.close.mockClear();
  mocks.categories = [
    { ...category(1, "科学"), sub: [category(2, "数学", 1)] },
    { ...category(3, "文学"), sub: [category(4, "小説", 3)] },
  ];
});

it("shows the original unknown genre, blocks saving, and saves the corrected row", async () => {
  const original = unresolved();
  const unchanged = { question: "Q2", answer: "A2" };
  const editor = setup([original, unchanged]);
  expect(editor.render()).toContain("CSVの小ジャンル: 未知");
  expect(button("確認").disabled).toBe(true);
  button("確認").onClick!();
  await button("保存").onClick!();
  expect(mocks.open).not.toHaveBeenCalled();
  expect(editor.onSave).not.toHaveBeenCalled();
  select("1件目の小ジャンル").onChange("2");
  editor.render();
  expect(button("確認").disabled).toBe(false);
  expect(select("1件目の小ジャンル").value).toBe("2");
  await button("保存").onClick!();
  expect(editor.onSave).toHaveBeenCalledWith(
    [
      {
        ...original,
        category: 2,
        subCategoryName: "数学",
        categoryError: undefined,
      },
      unchanged,
    ],
    null,
  );
  expect(original.subCategoryName).toBe("未知");
  expect(editor.onReload).toHaveBeenCalledOnce();
});

it("keeps an incompatible child visible after changing the parent until explicitly cleared", async () => {
  const editor = setup([
    {
      ...unresolved(),
      category: 2,
      subCategoryName: "数学",
      categoryError: undefined,
    },
  ]);
  editor.render();
  select("1件目の大ジャンル").onChange("3");
  expect(editor.render()).toContain("CSVの小ジャンル: 数学");
  expect(button("保存").disabled).toBe(true);
  expect(select("1件目の小ジャンル").data).toEqual([
    { value: "4", label: "小説" },
  ]);
  button("小ジャンルを解除").onClick!();
  editor.render();
  await button("保存").onClick!();
  expect(editor.onSave.mock.calls[0][0][0]).toMatchObject({
    category: 3,
    categoryName: "文学",
    subCategoryName: undefined,
    categoryError: undefined,
  });
});

it("resolves the child when a corrected parent matches, or explicitly removes all genres", () => {
  const editor = setup([
    { ...unresolved(), categoryName: "不明", subCategoryName: "数学" },
  ]);
  expect(editor.render()).toContain("CSVの大ジャンル: 不明");
  expect(select("1件目の小ジャンル").disabled).toBe(true);
  select("1件目の大ジャンル").onChange("1");
  editor.render();
  expect(select("1件目の小ジャンル").value).toBe("2");
  expect(button("保存").disabled).toBe(false);
  button("ジャンルなしにする").onClick!();
  editor.render();
  expect(editor.rows()[0]).toMatchObject({
    category: undefined,
    categoryName: undefined,
    subCategoryName: undefined,
    categoryError: undefined,
  });
  expect(button("保存").disabled).toBe(false);
});

it("does not submit twice while saving and retains edits on failure for retry", async () => {
  const row = {
    ...unresolved(),
    category: 2,
    subCategoryName: "数学",
    categoryError: undefined,
  };
  const editor = setup([row]);
  let rejectSave!: (reason: Error) => void;
  editor.onSave.mockImplementationOnce(
    () =>
      new Promise<void>((_resolve, reject) => {
        rejectSave = reject;
      }),
  );
  editor.render();
  const save = button("保存").onClick!;
  const pending = save();
  await save();
  expect(editor.onSave).toHaveBeenCalledOnce();
  rejectSave(new Error("通信エラー"));
  await pending;
  expect(editor.rows()).toEqual([row]);
  expect(editor.onReload).not.toHaveBeenCalled();
  expect(mocks.close).not.toHaveBeenCalled();
  await save();
  expect(editor.onSave).toHaveBeenCalledTimes(2);
  expect(editor.onReload).toHaveBeenCalledOnce();
});
