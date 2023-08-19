import { Card, Center, DefaultProps, Divider, Group, Loader, Title } from "@mantine/core";
import { Bar, BarChart, LabelList, Tooltip, XAxis, YAxis } from "recharts";
import useUserStatus from "../hooks/useUserStatus";
import dayjs, { Period } from '../plugins/dayjs';
import { useState } from "react";
import ActivitySelectRange from "./ActivitySelectRange";
import { useElementSize } from "@mantine/hooks";

interface Props extends DefaultProps {

}

export default function ActivityStatus({

}: Props) {
  const now = dayjs().format();
  const { ref, width } = useElementSize();
  const [ period, setPeriod ] = useState<Period>('day');
  const { userStatus } = useUserStatus(now, period);
  
  return (
    <>
      <Card ref={ref} >
        <Group position="apart">
          <Title size="h2">Status</Title>
          <ActivitySelectRange
            period={period}
            onClick={setPeriod}
          />
        </Group>
        <Divider my="sm"/>
        {
          !!userStatus ? 
          <BarChart
            width={width}
            height={300}
            data={userStatus}
            margin={{
              top: 20,
              left: -30
            }}
          >
            <XAxis 
              dataKey="label"
              interval={0}
              angle={-30}
              dx={-10}
              dy={5}
              tick={{
                fontSize: 12,
                fill: '#000',
              }}
            />
            <YAxis
              tick={{
                fontSize: 14,
                fill: '#000',
              }}
            />
            <Tooltip />
            <Bar dataKey="right" stackId="a" fill="#FF6B6B" />
            <Bar dataKey="wrong" stackId="a" fill="#339AF0" />
            <Bar dataKey="through" stackId="a" fill="#ADB5BD">
              <LabelList 
                dataKey="total" 
                position="top" 
                formatter={(v: string) => `${v}問`}
              />
            </Bar>
          </BarChart>
          :
          <Center h={300}>
            <Loader variant="dots"/>
          </Center>
        }
      </Card>
    </>
    
  )
}