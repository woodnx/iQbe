import { ComponentProps, ReactNode, useEffect } from "react";
import { AppShell, Group, Stack, Text } from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";
import useHeaderHeight from "@/hooks/useHeaderHeight";

interface Props extends ComponentProps<typeof Stack> {
  total: number;
  buttons: ReactNode;
  pagination: ReactNode;
  header?: ReactNode;
}

export default function QuizControllBar({
  total,
  buttons,
  pagination,
  header = <></>,
  ...others
}: Props) {
  const [ref, rect] = useResizeObserver();
  const { setHeaderHeight } = useHeaderHeight();
  const height = rect.height + rect.y * 2;

  useEffect(() => {
    setHeaderHeight(height);

    return () => {
      setHeaderHeight(0);
    };
  }, [rect]);

  return (
    <AppShell.Header h={height}>
      <Stack {...others} ref={ref} gap={0}>
        {header}
        <Group justify="space-between">
          <div>{buttons}</div>
          <Text ta="right">総問題数: {total}</Text>
        </Group>
        {pagination}
      </Stack>
    </AppShell.Header>
  );
}
