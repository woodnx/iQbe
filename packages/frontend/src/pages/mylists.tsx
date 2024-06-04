import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import MylistDeleteModal from '@/components/MylistDeleteModal';
import MylistEditModal from '@/components/MylistEditModal';
import QuizViewer from '@/components/QuizViewer';
import { useMylists } from '@/hooks/useMylists';
import useQuizzes from '@/hooks/useQuizzes';
import api from '@/plugins/api';
import { Card, getGradient, Group, Text, useMantineTheme } from '@mantine/core';

export default function Mylist(){
  const { mid } = useParams();
  const { setParams } = useQuizzes(`/mylist/${mid}`);
  const navigator = useNavigate();
  const { mylists, mutate } = useMylists();

  const mylistName = mylists?.find(list => list.mid == mid)?.name;

  const theme = useMantineTheme();

  useEffect(() => {
    setParams({
      perPage: 100,
    });
  }, [mid]);

  if (!mid) {
    navigator('/404');
    return;
  }

  const toEdit = async (listName: string) => {
    const list = await api.mylists.$put({ body: {
      mid,
      listName,
    }});
    mutate([ ...(mylists || []), list ]);
  }

  const toDelete = async () => {
    const list = await api.mylists.$delete({ body: {
      mid,
    }});
    navigator('/');
    mutate(list);
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
        path={`/mylist/${mid}`}
        headerCard={<MylistCard/>}
      />
    </>
  )
}