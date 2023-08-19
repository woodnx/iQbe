import { Center, DefaultProps, Group, Paper, Space, Text } from "@mantine/core";
import * as icons from '@tabler/icons-react'

interface Props extends DefaultProps{
  rank: number,
  name: string,
  count: number,
}

const defineColor = (rank: number) => {
  if (rank === 1) return '#ffbf00'
  else if (rank === 2) return '#808080'
  else if (rank === 3) return '#b87333'
  else return '#343A40'
}

export default function ActivityRank({
  rank,
  name,
  count,
}: Props) {
  const iconName = `IconCircleNumber${rank}`;

  // @ts-ignore
  const Icon: JSX.Element = icons[iconName];

  return (
    <Paper h={60} p="sm">
      <Group position="apart">
        <Center my="auto">
          { // @ts-ignore 
            <Icon color={defineColor(rank)} size={40}/>
          }
          <Space ml="sm"/>
          <Text size={20} align="center">{name}</Text>
        </Center>
        {count}問
      </Group>
    </Paper>
  )
}