import useUserStatus from "@/hooks/useUserStatus";
import dayjs, { Period } from "@/plugins/dayjs";
import { BarChart } from "@mantine/charts";
import { Card, Center, Divider, Group, Loader, Title } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import ActivitySelectRange from "./ActivitySelectRange";

export default function ActivityStatus() {
  const navigate = useNavigate();
  const now = dayjs().format();
  const { ref, width } = useElementSize();
  const [period, setPeriod] = useState<Period>("day");
  const { userStatus } = useUserStatus(now, period);

  return (
    <>
      <Card ref={ref}>
        <Group justify="space-between">
          <Title size="h2">演習状況</Title>
          <ActivitySelectRange period={period} onClick={setPeriod} />
        </Group>
        <Divider my="sm" />
        {userStatus ? (
          <BarChart
            w={width - 20}
            h={300}
            data={userStatus}
            type="stacked"
            dataKey="label"
            xAxisProps={{
              interval: 0,
              angle: -30,
              dx: -10,
              dy: 10,
              tick: {
                fontSize: 12,
                fill: "#000",
              },
            }}
            accessibilityLayer={false}
            series={[
              { name: "right", label: "正解", color: "red.6" },
              { name: "wrong", label: "不正解", color: "blue.6" },
              { name: "through", label: "スルー", color: "gray.6" },
            ]}
            barChartProps={{
              onClick: ({ activeTooltipIndex, isTooltipActive }) => {
                if (!isTooltipActive || activeTooltipIndex == null) return;

                const index = Number(activeTooltipIndex);
                if (!Number.isInteger(index)) return;

                const status = userStatus[index];
                if (!status) return;

                void navigate({
                  to: "/history",
                  search: {
                    since: dayjs(status.start).toISOString(),
                    until: dayjs(status.end).toISOString(),
                  },
                });
              },
              style: { cursor: "pointer" },
            }}
          />
        ) : (
          <Center h={300}>
            <Loader variant="dots" />
          </Center>
        )}
      </Card>
    </>
  );
}
