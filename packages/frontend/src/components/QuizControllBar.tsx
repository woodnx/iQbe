import { ReactNode } from "react";
import { Grid, Group, Header, Text } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";

interface QuizControllBarProps {
  height: number,
  total: number,
  buttons: ReactNode,
  pagination: ReactNode,
  header?: ReactNode,
}

export default function QuizControllBar({ 
  total, 
  buttons, 
  pagination,
  header = <></>
}: QuizControllBarProps) {
  const { ref, height } = useElementSize();
  return (
    <Header
      height={height}
      fixed
    >
      <Grid px={10} pt={10} ref={ref}>
        { header }
        <Grid.Col span={12}>
          <Group position="apart">
            <div>{ buttons }</div>
            <Text ta="right">総問題数: {total}</Text>
          </Group>
        </Grid.Col>
        { pagination }
      </Grid>
    </Header>
  );
}