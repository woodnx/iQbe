import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import MylistDeleteModal from '@/components/MylistDeleteModal';
import MylistEditModal from '@/components/MylistEditModal';
import QuizViewer from '@/components/QuizViewer';
import { useMylists } from '@/hooks/useMylists';
import useQuizzes from '@/hooks/useQuizzes';
import { Card, getGradient, Group, Text, useMantineTheme } from '@mantine/core';
import { $api } from '@/utils/client';

export default function Mylist(){
  const { mid } = useParams();
  const { setParams } = useQuizzes();
  const navigator = useNavigate();
  const { mylists } = useMylists();
  const { mutate: editMylist } = $api.useMutation("put", "/mylists");
  const { mutate: deleteMylist } = $api.useMutation("delete", "/mylists");

  const mylistName = mylists?.find(list => list.mid == mid)?.name;

  const theme = useMantineTheme();

  useEffect(() => {
    setParams({
      maxView: 100,
      mid,
    });
  }, [mid]);

  if (!mid) {
    navigator('/404');
    return;
  }

  const toEdit = async (listName: string) => {
    editMylist({ body: {
      mid,
      listName,
    }});
  }

  const toDelete = async () => {
    deleteMylist({ body: {
      mid,
    }});
    navigator('/');
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
            mylistName={mylistName || ''}
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
        headerCard={<MylistCard/>}
      />
    </>
  )
}