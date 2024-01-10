import { useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Card, Group, Text } from "@mantine/core";
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
      sx={(theme) => ({
        backgroundImage: theme.fn.gradient(),
        color: theme.white,
      })}
    >
      <Group position="apart">
        <Text weight={700} size={25}>{ mylistName }</Text>
        <Group spacing="md">
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