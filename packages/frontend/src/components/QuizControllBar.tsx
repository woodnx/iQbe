import { ReactNode } from "react";
import { DefaultProps, Group, Header, Stack, Text } from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";

interface Props extends DefaultProps {
  total: number,
  buttons: ReactNode,
  pagination: ReactNode,
  header?: ReactNode,
}

export default function QuizControllBar({ 
  total, 
  buttons, 
  pagination,
  header = <></>,
  ...others
}: Props) {
  const [ ref, rect ] = useResizeObserver();

  return (
    <Header
      height={rect.height + rect.y * 2}
      fixed
    >
      <Stack {...others} ref={ref} spacing={0} >
        { header }
        <Group position="apart">
          <div>{ buttons }</div>
          <Text ta="right">総問題数: {total}</Text>
        </Group>
        { pagination }
      </Stack>
    </Header>
  );
}