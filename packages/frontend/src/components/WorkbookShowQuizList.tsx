import { useEffect } from "react";
import { Card, Group, Text, getGradient, useMantineTheme } from "@mantine/core";
import useQuizzes from "@/hooks/useQuizzes";
import { useWorkbooks } from "@/hooks/useWorkbooks";
import QuizViewer from "./QuizViewer";

interface Props {
  wid: string,
}

export default function({ wid }: Props) {
  const isAll = (wid == 'all');
  const theme = useMantineTheme();
  const { setParams } = useQuizzes();
  const { workbooks } = useWorkbooks(true);
  
  const workbooksName = isAll 
  ? 'すべてのクイズ' 
  : workbooks?.find(list => list.wid == wid)?.name;

  useEffect(() => {
    setParams({ 
      maxView: 100, 
      wids: isAll ? undefined : [ wid ] 
    })
  }, []);

  const CreateCard = () => (
    <Card 
      mb="xs"
      w="100%" 
      withBorder
      style={{
        backgroundImage: getGradient({ deg: 45, from: 'indigo', to: 'cyan' }, theme),
        color: `var(--mantine-color-white)`,
      }}
    >
      <Group justify="space-between">
        <Text fw={700} fz={25}>{ workbooksName }</Text>
      </Group>
    </Card>
  );

  return (
    <>
      <QuizViewer
        headerCard={<CreateCard/>}
      />
    </>
  );
}