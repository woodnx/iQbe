import { useState } from "react";
import { Card, Center, Divider, Group, Loader, Paper, Text, Title } from "@mantine/core";
import { Period } from "@/plugins/dayjs";
import { useAllUserRanking } from "@/hooks/useUserRanking";
import ActivityRank from "./ActivityRank";
import ActivitySelectRange from "./ActivitySelectRange";
import { IconCircleNumber1, IconCircleNumber2, IconCircleNumber3, IconCircleNumber4, IconCircleNumber5, IconCircleNumber6 } from "@tabler/icons-react";

export default function ActivityUserRanking(){
  const [ period, setPeriod ] = useState<Period>('day');
  const { allUserRanking } = useAllUserRanking(period);
  const icons = [
    IconCircleNumber1,
    IconCircleNumber2,
    IconCircleNumber3,
    IconCircleNumber4,
    IconCircleNumber5,
    IconCircleNumber6,
  ]

  const Item = allUserRanking?.length !== 0 ? 
  allUserRanking?.map((r, idx) => {
    return (
      <ActivityRank
        name={r.nickname || r.username}
        icon={icons[idx]}
        rank={r.rank}
        count={r.count}
        key={r.uid}
      />
    )
  }) 
  :
  <Center><Text>データがありません...😢</Text></Center>
  
  return (
    <Card>
      <Group justify="space-between">
        <Title size="h2">ランキング</Title>
        <ActivitySelectRange
          period={period}
          onClick={setPeriod}
        />
      </Group>
      <Divider my="sm"/>
      <Paper mih={300}>
      {
        !!allUserRanking ?
          Item
        :
        <Center h={300}>
          <Loader variant="dots"/>
        </Center>
      }
      </Paper>
    </Card>
  )
}