import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Group, Text, getGradient, useMantineTheme } from "@mantine/core";
import api from "@/plugins/api";
import { useInput } from "@/hooks";
import useQuizzes from "@/hooks/useQuizzes";
import MylistDeleteModal from "@/components/MylistDeleteModal";
import MylistEditModal from "@/components/MylistEditModal";
import { useWorkbooks } from "@/hooks/useWorkbooks";
import QuizViewer from "./QuizViewer";

interface Props {
  wid: string,
}

export default function({ wid }: Props) {
  const isAll = (wid == 'all');
  const navigator = useNavigate();
  const { setParams } = useQuizzes("/create");
  const { workbooks, mutate } = useWorkbooks(true);
  
  const workbooksName = isAll ? 'すべてのクイズ' : workbooks?.find(list => list.wid == wid)?.name;
  const [ newNameProps ] = useInput(workbooksName || '');

  const theme = useMantineTheme();

  useEffect(() => {
    setParams({ 
      perPage: 100, 
      workbooks: isAll ? undefined : [ wid ] 
    })
  }, [])

  const toEdit = async () => {
    const body = {
      wid,
      newWorkbookName: newNameProps.value,
    };

    api.workbooks.put({ body })

    const newList = workbooks?.map((w) => {
      if (w.wid !== wid) return w;

      w.name = newNameProps.value;
      return w;
    })
    mutate(newList);
  }

  const toDelete = async () => {
    const body = { wid };
    api.workbooks.delete({ body });

    const newList = workbooks?.filter(w => w.wid !== wid);
    mutate(newList);

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
              newNameProps={newNameProps}
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