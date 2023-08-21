import { Grid, Group, Header, Text } from "@mantine/core";
import { ReactNode } from "react";

interface QuizControllBarProps {
  height: number,
  total: number,
  buttons: ReactNode,
  pagination: ReactNode,
}

export default function QuizControllBar({ 
  height, 
  total, 
  buttons, 
  pagination 
}: QuizControllBarProps) {
  return (
    <Header
      height={height}
      fixed
    >
      <Grid px={10} pt={10}>
        <Grid.Col span={12}>
          <Group position="apart">
            <div>{ buttons }</div>
            <Text ta="right">総問題数: {total}</Text>
          </Group>
        </Grid.Col>
        { pagination }
      </Grid>
    </Header>
  )
}