import { ScrollArea, Table } from "@mantine/core";
import { Element } from "./CreateDashboard";

interface Props {
  elements: Element[]
}

export default function PreviewCsvTable({ elements }: Props) {
  const rows = elements.map((element, idx) => (
    <Table.Tr key={idx}>
      <Table.Td>{idx + 1}</Table.Td>
      <Table.Td>{element.question}</Table.Td>
      <Table.Td>{element.answer}</Table.Td>
      <Table.Td>{element.anotherAnswer}</Table.Td>
    </Table.Tr>
  ));

  return (
    <ScrollArea h={500}>
      <Table.ScrollContainer minWidth={300}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>No.</Table.Th>
              <Table.Th>問題</Table.Th>
              <Table.Th>解答</Table.Th>
              <Table.Th>別解・正答基準</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </ScrollArea>
  )
}
