import { Center, Group, Paper, Space, Text } from "@mantine/core";
import { Icon } from "@tabler/icons-react";

interface Props {
  rank: number;
  icon: Icon;
  name: string;
  count: number;
}

const defineColor = (rank: number) => {
  if (rank === 1) return "#ffbf00";
  else if (rank === 2) return "#808080";
  else if (rank === 3) return "#b87333";
  else return "#343A40";
};

export default function ({ rank, icon, name, count }: Props) {
  const Icon = icon;

  return (
    <Paper h={60} p="sm">
      <Group justify="space-between">
        <Center my="auto">
          {<Icon color={defineColor(rank)} size={40} />}
          <Space ml="sm" />
          <Text fz={20}>{name}</Text>
        </Center>
        {count}問
      </Group>
    </Paper>
  );
}
