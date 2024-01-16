import { useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Card, Group, Text, getGradient, useMantineTheme } from "@mantine/core";
import MylistDeleteModal from "@/components/MylistDeleteModal";
import MylistEditModal from "@/components/MylistEditModal";
import QuizViewer from "@/components/QuizViewer";
import { useInput } from "@/hooks";
import useQuizzes from "@/hooks/useQuizzes";
import { useMylists } from "@/hooks/useMylists";
import axios from "@/plugins/axios";
import { MylistInformation } from "@/types";

export default function Mylist(){
  const { setParams } = useQuizzes('/mylist')
  const { mid } = useParams();
  const navigator = useNavigate();
  const { mylists, mutate } = useMylists();

  const mylistName = mylists?.find(list => list.mid == mid)?.name;
  const [ newNameProps ] = useInput(mylistName || '');

  const theme = useMantineTheme();

  useEffect(() => {
    setParams({
      mid,
      perPage: 100,
    });
  }, [mid]);

  const toEdit = async () => {
    const newlist = await axios.put<MylistInformation[]>('/mylists/rename', {
      mid,
      newName: newNameProps.value,
    }).then(res => res.data);
    mutate(newlist);
  }

  const toDelete = async () => {
    const newlist = await axios.delete<MylistInformation[]>('/mylists/list', {
      data: {
        mid,
      }
    }).then(res => res.data);
    navigator('/');
    mutate(newlist);
  }

  const MylistCard = () => (
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
        <Text fw={700} fz={25}>{ mylistName }</Text>
        <Group justify="md">
          <MylistEditModal
            newNameProps={newNameProps}
            onSave={toEdit}
          />
          <MylistDeleteModal
            onDelete={toDelete}
          />
        </Group>
      </Group>
    </Card>
  )

  return (
    <>
      <QuizViewer 
        key={mid} 
        path='/mylist'
        headerCard={<MylistCard/>}
      />
    </>
  )
}