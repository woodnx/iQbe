import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, DefaultProps, Group, Text } from "@mantine/core";
import { WorkbooksData } from "@/types";
import useQuizzes from "@/hooks/useQuizzes";
import MylistDeleteModal from "@/components/MylistDeleteModal";
import MylistEditModal from "@/components/MylistEditModal";
import { useInput } from "@/hooks";
import axios from "@/plugins/axios";
import { useWorkbooks } from "@/hooks/useWorkbooks";
import QuizViewer from "./QuizViewer";

interface Props extends DefaultProps {
  wid: string,
}

export default function({ wid }: Props) {
  const isAll = (wid == 'all');
  const navigator = useNavigate();
  const { setParams } = useQuizzes("/create");
  const { workbooks, mutate } = useWorkbooks();
  
  const workbooksName = isAll ? 'すべてのクイズ' : workbooks?.find(list => list.wid == wid)?.name;
  const [ newNameProps ] = useInput(workbooksName || '');

  useEffect(() => {
    setParams({ 
      perPage: 100, 
      workbooks: isAll ? undefined : [ wid ] 
    })
  }, [])

  const toEdit = async () => {
    const newlist = await axios.put<WorkbooksData[]>('/workbooks/rename', {
      wid,
      newName: newNameProps.value,
    }).then(res => res.data);
    mutate(newlist);
  }

  const toDelete = async () => {
    const newlist = await axios.delete<WorkbooksData[]>('/workbooks', {
      data: {
        wid
      }
    }).then(res => res.data);
    navigator('/create');
    mutate(newlist);
  }

  const CreateCard = () => (
    <Card 
      mb="xs"
      w="100%" 
      withBorder
      sx={(theme) => ({
        backgroundImage: theme.fn.gradient(),
        color: theme.white,
      })}
    >
      <Group position="apart">
        <Text weight={700} size={25}>{ workbooksName }</Text>
        {
          !isAll ? <Group spacing="md">
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