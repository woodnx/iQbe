import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Group, Text, getGradient, useMantineTheme } from "@mantine/core";
import useQuizzes from "@/hooks/useQuizzes";
import MylistDeleteModal from "@/components/MylistDeleteModal";
import MylistEditModal from "@/components/MylistEditModal";
import { useWorkbooks } from "@/hooks/useWorkbooks";
import QuizViewer from "./QuizViewer";
import { $api } from "@/utils/client";

interface Props {
  wid: string,
}

export default function({ wid }: Props) {
  const isAll = (wid == 'all');
  const navigator = useNavigate();
  const { setParams } = useQuizzes("/create");
  const { workbooks } = useWorkbooks(true);
  const { mutate: updateMutate } = $api.useMutation("put", "/workbooks/{wid}");
  const { mutate: deleteMutate } = $api.useMutation("delete", "/workbooks/{wid}");
  
  const workbooksName = isAll ? 'すべてのクイズ' : workbooks?.find(list => list.wid == wid)?.name;

  const theme = useMantineTheme();

  useEffect(() => {
    setParams({ 
      perPage: 100, 
      workbooks: isAll ? undefined : [ wid ] 
    })
  }, [])

  const toEdit = async (newWorkbookName: string) => {
    updateMutate({ 
      body: {
        name: newWorkbookName,
      },
      params: { path: { wid }}
    });
  }

  const toDelete = async () => {
    deleteMutate({ params: {
      path: { wid }
    } });

    navigator('/create');
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
        {
          !isAll ? <Group gap="md">
            <MylistEditModal
              mylistName={workbooksName || ''}
              onSave={toEdit}
            />
            <MylistDeleteModal
              onDelete={toDelete}
            />
          </Group> : null
        }
      </Group>
    </Card>
  )

  return (
    <>
      <QuizViewer
        path="/create"
        headerCard={<CreateCard/>}
      />
    </>
  )
}