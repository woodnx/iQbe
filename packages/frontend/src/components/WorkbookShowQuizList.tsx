import { useEffect } from "react";
import { Card, Center, Group, Loader, Text, getGradient, useMantineTheme } from "@mantine/core";
import useQuizzes from "@/hooks/useQuizzes";
import { useWorkbooks } from "@/hooks/useWorkbooks";
import QuizViewer from "./QuizViewer";
import { Navigate } from "react-router-dom";

interface Props {
  wid: string,
}

export default function({ wid }: Props) {
  const theme = useMantineTheme();
  const { setParams } = useQuizzes();
  const { workbooks, isLoading } = useWorkbooks(true);
  
  const workbook = workbooks?.find(list => list.wid == wid);
  const workbooksName = workbook?.name;

  useEffect(() => {
    setParams({ 
      maxView: 100, 
      wids: [ wid ],
    });
  }, []);

  if (isLoading) return <Center><Loader/></Center>;

  const hasAccess = workbooks?.some((workbook) => workbook.wid === wid);

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

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