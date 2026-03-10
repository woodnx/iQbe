import { Card, Stack, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import WorkbookCard from "@/features/workbook/components/WorkbookCard";
import { $api } from "@/utils/client";

export const Route = createFileRoute("/collection")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: workbooks } = $api.useQuery("get", "/workbooks");
  const { data: mylists } = $api.useQuery("get", "/mylists");

  return (
    <>
      <Title size="h2">問題集</Title>
      <Stack>
        {workbooks?.map((workbook) => (
          <WorkbookCard key={workbook.wid} workbook={workbook} />
        ))}
      </Stack>

      <Title size="h2">マイリスト</Title>
      <Stack>
        {mylists?.map((mylist) => (
          <Card key={mylist.mid} withBorder radius="lg">
            <Title size="h3">{mylist.name}</Title>
          </Card>
        ))}
      </Stack>
    </>
  );
}
