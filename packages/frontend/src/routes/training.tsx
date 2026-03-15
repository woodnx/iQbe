import {
  Button,
  Card,
  Flex,
  Grid,
  Group,
  Indicator,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { modals } from "@mantine/modals";
import { IconHistory } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import { $api } from "@/utils/client";
import { convertDates } from "@/utils/convertDates";

export const Route = createFileRoute("/training")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: workbooks } = $api.useQuery("get", "/workbooks");
  // const { data: histories } = $api.useQuery("get", "/histories/{since}/{until}");
  const [dates, setDates] = useState<[Date | null, Date | null]>([null, null]);
  const navigate = useNavigate();
  const maxWorkbook = 5;

  return (
    <Grid>
      <Grid.Col span={12}>
        <Stack>
          <Card padding="lg" radius="lg">
            <div>
              <Text fw={700} size="xl">
                前回の続き
              </Text>
              <Text c="dimmed" size="sm" mt="xs">
                前回の学習内容から再開できます
              </Text>
              <Button
                color="green"
                fullWidth
                mt="md"
                radius="md"
                variant="filled"
              >
                演習を開始
              </Button>
            </div>
          </Card>
        </Stack>
      </Grid.Col>

      <Grid.Col
        span={{ base: 12, md: 6 }}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Group align="end" mb="xs">
          <Title size="h3">問題集から演習</Title>
          <Text c="dimmed" size="sm">
            最近演習した順
          </Text>
        </Group>
        <Card radius="lg" style={{ flex: 1 }}>
          <Stack>
            {workbooks?.slice(0, maxWorkbook).map((workbook) => (
              <Group
                key={workbook.wid}
                style={{
                  cursor: "pointer",
                }}
                component="a"
                gap="xs"
                wrap="nowrap"
                onClick={() =>
                  modals.openContextModal({
                    modal: "practiceSetting",
                    title: "演習の設定",
                    innerProps: {
                      onTrain: (judgements) => {
                        const seed = Math.floor(Math.random() * 100000);
                        navigate({
                          to: "/practice",
                          search: () => ({
                            page: 1,
                            seed,
                            maxView: 100,
                            wids: workbook.wid,
                            judgements: judgements,
                            isTransfer: true,
                          }),
                          replace: true,
                        });
                      },
                    },
                  })
                }
              >
                <div
                  style={{
                    width: "4px",
                    backgroundColor: "#a5d8ff",
                    alignSelf: "stretch",
                    borderRadius: "12px",
                    flexShrink: 0,
                  }}
                ></div>
                <div>
                  <Text fw={700} size="lg" lineClamp={1}>
                    {workbook.name}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {dayjs(workbook.date).format("YYYY/MM/DD")}
                  </Text>
                </div>
              </Group>
            ))}
            {!!workbooks && workbooks.length > maxWorkbook && (
              <Button
                justify="end"
                size="sm"
                variant="transparent"
                onClick={() =>
                  navigate({
                    to: "/library",
                  })
                }
              >
                → ほかの問題集も見る
              </Button>
            )}
          </Stack>
        </Card>
      </Grid.Col>

      <Grid.Col
        span={{ base: 12, md: 6 }}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Group mb="xs">
          <IconHistory />
          <Title size="h3">演習履歴</Title>
        </Group>
        <Card radius="lg" style={{ flex: 1 }}>
          <Flex justify="center">
            <DatePicker
              type="range"
              allowSingleDateInRange
              monthLabelFormat="YYYY年 M月"
              renderDay={(d) => {
                const date = dayjs(d);
                return (
                  <Indicator size={6} color="red" offset={-2} disabled={true}>
                    <div>{date.date()}</div>
                  </Indicator>
                );
              }}
              value={dates}
              onChange={setDates}
            />
          </Flex>

          <Group grow mt="lg">
            <Button
              disabled={!dates[0]}
              color="green"
              mt="sm"
              radius="md"
              variant="filled"
              onClick={() => {
                const d = convertDates(dates);
                modals.openContextModal({
                  modal: "practiceSetting",
                  title: "演習の設定",
                  innerProps: {
                    isContainNA: false,
                    onTrain: (judgements) => {
                      const seed = Math.floor(Math.random() * 100000);
                      navigate({
                        to: "/practice",
                        search: () => ({
                          page: 1,
                          seed,
                          maxView: 100,
                          since: d[0],
                          until: d[1],
                          judgements: judgements,
                          isTransfer: true,
                        }),
                      });
                    },
                  },
                });
              }}
            >
              演習を開始
            </Button>
            <Button
              disabled={!dates[0]}
              color="blue"
              mt="sm"
              radius="md"
              variant="outline"
              onClick={() => {
                const d = convertDates(dates);

                navigate({
                  to: "/history",
                  search: () => ({
                    since: d[0],
                    until: d[1],
                    judgements: [0, 1, 2],
                  }),
                });
              }}
            >
              履歴を見る
            </Button>
          </Group>
        </Card>
      </Grid.Col>
    </Grid>
  );
}
