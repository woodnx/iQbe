import { Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconBook2, IconList, IconStar } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { $api } from "@/utils/client";

export const Route = createFileRoute("/collection")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: workbooks } = $api.useQuery("get", "/workbooks");
  const { data: mylists } = $api.useQuery("get", "/mylists");

  const navigate = useNavigate();

  return (
    <>
      <Group mb="xs" ml="sm">
        <IconBook2 />
        <Title size="h3">問題集</Title>
      </Group>
      <Card radius="lg">
        <Stack>
          {workbooks?.map((workbook) => (
            <Group
              key={workbook.wid}
              onClick={(e) => {
                e.preventDefault();
                navigate({
                  to: "/workbook/$wid",
                  params: { wid: `${workbook.wid}` },
                });
              }}
              style={{
                cursor: "pointer",
              }}
              component="a"
            >
              <div
                style={{
                  width: "4px",
                  backgroundColor: "#a5d8ff",
                  alignSelf: "stretch",
                  borderRadius: "12px",
                }}
              ></div>
              <div>
                <Text fw={700} size="lg">
                  {workbook.name}
                </Text>
                <Text c="dimmed" size="sm">
                  {dayjs(workbook.date).format("YYYY/MM/DD")}
                </Text>
              </div>
            </Group>
          ))}
        </Stack>
      </Card>

      <Group align="center" mt="lg" mb="xs" ml="sm">
        <IconList />
        <Title size="h3">マイリスト</Title>
      </Group>
      <Card radius="lg">
        <Stack>
          {mylists?.map((mylist) => (
            <Group
              key={mylist.mid}
              onClick={(e) => {
                e.preventDefault();
                navigate({
                  to: "/mylist/$mid",
                  params: { mid: `${mylist.mid}` },
                });
              }}
              style={{
                cursor: "pointer",
              }}
              component="a"
            >
              <div
                style={{
                  width: "4px",
                  backgroundColor: "#a5d8ff",
                  alignSelf: "stretch",
                  borderRadius: "12px",
                }}
              ></div>
              <Text fw={700} size="lg">
                {mylist.name}
              </Text>
            </Group>
          ))}
        </Stack>
      </Card>

      <Card
        radius="lg"
        mt="lg"
        onClick={(e) => {
          e.preventDefault();
          navigate({
            to: "/favorite",
          });
        }}
        style={{
          cursor: "pointer",
        }}
        component="a"
      >
        <Group>
          <IconStar />
          <Title size="h3">お気に入り</Title>
        </Group>
      </Card>
    </>
  );
}
