import { Button, ScrollArea, Select, Table, Text } from "@mantine/core";
import type { Element } from "@/routes/create";
import type { Category } from "@/utils/api-types";

interface Props {
  elements: Element[];
  categories: Category[];
  onChange: (elements: Element[]) => void;
  disabled?: boolean;
}

export default function PreviewCsvTable({
  elements,
  categories,
  onChange,
  disabled,
}: Props) {
  const parents = categories.filter((category) => !category.disabled);
  const update = (index: number, genre: Partial<Element>) => {
    if (disabled) return;
    onChange(
      elements.map((element, i) =>
        i === index ? { ...element, ...genre } : element,
      ),
    );
  };
  const clearGenre = (index: number) =>
    update(index, {
      category: undefined,
      categoryName: undefined,
      subCategoryName: undefined,
      categoryError: undefined,
    });
  const rows = elements.map((element, idx) => {
    const matches = parents.filter(
      (category) => category.name === element.categoryName,
    );
    const parent = matches.length === 1 ? matches[0] : undefined;
    const children =
      parent?.sub?.filter((category) => !category.disabled) ?? [];
    const child = children.find((category) => category.id === element.category);
    return (
      <Table.Tr key={idx}>
        <Table.Td>{idx + 1}</Table.Td>
        <Table.Td>{element.question}</Table.Td>
        <Table.Td>{element.answer}</Table.Td>
        <Table.Td style={{ whiteSpace: "pre-wrap" }}>
          {element.anotherAnswer}
        </Table.Td>
        <Table.Td>
          <Select
            aria-label={`${idx + 1}件目の大ジャンル`}
            placeholder="大ジャンルを選択"
            searchable
            disabled={disabled}
            data={parents.map((category) => ({
              value: String(category.id),
              label: category.name,
            }))}
            value={parent ? String(parent.id) : null}
            onChange={(value) => {
              const selected = parents.find(
                (category) => String(category.id) === value,
              );
              if (!selected) return;
              const subMatches =
                selected.sub?.filter(
                  (category) =>
                    !category.disabled &&
                    category.name === element.subCategoryName,
                ) ?? [];
              const sub = subMatches.length === 1 ? subMatches[0] : undefined;
              const unresolved = !!element.subCategoryName && !sub;
              update(idx, {
                categoryName: selected.name,
                category: unresolved ? undefined : (sub?.id ?? selected.id),
                categoryError: unresolved
                  ? "小ジャンルを選び直すか、解除してください。"
                  : undefined,
              });
            }}
          />
          {element.categoryError && (
            <Text size="xs" c="red" role="alert">
              {element.categoryError}
            </Text>
          )}
          {element.categoryName && !parent && (
            <Text size="xs">CSVの大ジャンル: {element.categoryName}</Text>
          )}
          <Button
            variant="subtle"
            size="compact-xs"
            mt="xs"
            disabled={disabled}
            onClick={() => clearGenre(idx)}
          >
            ジャンルなしにする
          </Button>
        </Table.Td>
        <Table.Td>
          <Select
            aria-label={`${idx + 1}件目の小ジャンル`}
            placeholder="小ジャンルを選択（任意）"
            searchable
            clearable
            disabled={disabled || !parent}
            data={children.map((category) => ({
              value: String(category.id),
              label: category.name,
            }))}
            value={child ? String(child.id) : null}
            onChange={(value) => {
              if (!parent) return;
              const selected = children.find(
                (category) => String(category.id) === value,
              );
              update(idx, {
                category: selected?.id ?? parent.id,
                subCategoryName: selected?.name,
                categoryError: undefined,
              });
            }}
          />
          {element.subCategoryName && !child && (
            <Text size="xs">CSVの小ジャンル: {element.subCategoryName}</Text>
          )}
          {element.subCategoryName && (
            <Button
              variant="subtle"
              size="compact-xs"
              mt="xs"
              disabled={disabled || !parent}
              onClick={() => {
                if (parent)
                  update(idx, {
                    category: parent.id,
                    subCategoryName: undefined,
                    categoryError: undefined,
                  });
              }}
            >
              小ジャンルを解除
            </Button>
          )}
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <ScrollArea h={500}>
      <Table.ScrollContainer minWidth={1000}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>No.</Table.Th>
              <Table.Th>問題</Table.Th>
              <Table.Th>解答</Table.Th>
              <Table.Th>別解・正答基準</Table.Th>
              <Table.Th miw={220}>大ジャンル</Table.Th>
              <Table.Th miw={220}>小ジャンル</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </ScrollArea>
  );
}
