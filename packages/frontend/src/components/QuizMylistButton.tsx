import { ComponentProps, useState } from 'react';

import { useIsMobile } from '@/contexts/isMobile';
import { MylistInformation } from '@/types';
import { $api } from '@/utils/client';
import { ActionIcon, Button, Checkbox, Divider, Menu } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlaylistAdd, IconPlus } from '@tabler/icons-react';

import classes from './styles/QuizMylistButton.module.css';
import { modals } from '@mantine/modals';

interface Props extends ComponentProps<typeof Button> {
  qid: string,
  registerdMylistId: string[],
  mylists: MylistInformation[],
}

export default function QuizMylistButton({
  qid,
  registerdMylistId,
  mylists,
}: Props) {
  const [ selectedMyListIdx, setSelectedMylistIdx ] = useState(registerdMylistId.map(id => mylists?.findIndex(list => list.mid == id)));
  const isMobile = useIsMobile();
  const { mutate: addQuizToMylist } = $api.useMutation("post", "/register");
  const { mutate: deleteQuizFromMylist } = $api.useMutation("post", "/unregister")

  const saveToList = async (mid: string, arrayIdx: number) => {
    try {
      if (!selectedMyListIdx.includes(arrayIdx)) { // add quiz into mylist
        addQuizToMylist({ 
          body: { 
            qid,
            mid,
          },
        });
        setSelectedMylistIdx([...selectedMyListIdx, arrayIdx]);
        notifications.show({
          title: 'マイリストに追加',
          message: 'マイリストにクイズを追加しました',
        });
      } 
      else {  // delete quiz from mylist
        deleteQuizFromMylist({ 
          body: { 
            qid,
            mid,
          },
        });
        setSelectedMylistIdx(selectedMyListIdx.filter(idx => idx != arrayIdx));
        notifications.show({
          title: 'マイリストから削除',
          message: 'マイリストからクイズを削除しました',
        });
      }
    } catch(e) {
      notifications.show({
        title: '何らかの障害が発生しました',
        message: '何度も続く場合はサポート担当に問い合わせてください',
        color: 'red',
      });
      return;
    }
  };

  const defaultButton = (
    <Button
      classNames={{root: classes.button}}
      leftSection={<IconPlaylistAdd />}
      variant="outline"
      size="xs"
      bg="#fff"
    >追加</Button>
  );

  const mobileButton = (
    <ActionIcon
      size="md" 
      color="blue"
      variant="light"
    >
      <IconPlaylistAdd/>
    </ActionIcon>
  );

  return (
    <>
      <Menu 
        shadow="sm" 
        width={200} 
        position="right-start"
        withinPortal
        closeOnItemClick={false}
      >
        <Menu.Target>
          { isMobile ? mobileButton : defaultButton }
        </Menu.Target>
        <Menu.Dropdown>
          {
            mylists?.map((m, idx) => 
              <Menu.Item 
                key={m.mid}
              >
                <Checkbox
                  label={m.name}
                  checked={selectedMyListIdx.includes(idx)}
                  onChange={() => saveToList(m.mid, idx)}
                />
              </Menu.Item>
            )
          }
          <Divider/>
          <Menu.Item 
            leftSection={<IconPlus size={14}/>}
            onClick={() => {
              modals.openContextModal({
                modal: 'mylistCreate',
                title: 'マイリストを新規作成',
                innerProps: {
                  qid
                },
                size: 'md',
                centered: true,
                zIndex: 10000,
              })
            }}
          >
            マイリストを作成
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
    
  );
}