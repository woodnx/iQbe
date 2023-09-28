import { ActionIcon, Button, Checkbox, DefaultProps, Divider, Menu, createStyles } from "@mantine/core";
import { IconPlaylistAdd, IconPlus } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import MylistCreateModal from "./MylistCreateModal";
import axios from "../plugins/axios";
import { MylistInformation } from "../types";
import { useEffect, useState } from "react";
import Sqids from "sqids";
import dayjs from "dayjs";
import useUserStore from "../store/user";

const useStyle = createStyles((theme) => ({
  button: {
    ...theme.fn.focusStyles(),
    borderRadius: theme.radius.xl,
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
    },
  }
}));

interface Props extends DefaultProps {
  quizId: number,
  registerdMylistId: number[],
  mylists: MylistInformation[],
  isMobile?: boolean,
}

export default function QuizMylistButton({
  quizId,
  registerdMylistId,
  mylists,
  isMobile = false,
}: Props) {
  const [ creating, create ] = useDisclosure(false);
  const { classes } = useStyle();
  const [ selectedMyListIdx, setSelectedMylistIdx ] = useState<(number | undefined)[]>([]);
  const userId = useUserStore((state) => state.userId);

  useEffect(() => {
    setSelectedMylistIdx(registerdMylistId.map(id => mylists?.findIndex(list => list.id == id)));
  }, [mylists, quizId]);

  const createMylist = async (mylistname: string) => {
    const sqids = new Sqids({ minLength: 10, alphabet: mylistname });
    const now = dayjs().unix();
    const mid = sqids.encode([ userId, now ]);

    const newMyList = await axios.post<MylistInformation>('/mylists', {
      listName: mylistname,
      mid,
    }).then(res => res.data);

    await axios.put('/mylists/quiz', {
      quizId,
      mylistId: newMyList.id,
    })
  }

  const saveToList = async (mylistId: number, arrayIdx: number) => {
    if (!selectedMyListIdx.includes(arrayIdx)) { // add to mylist
      await axios.put('/mylists/quiz', {
        quizId,
        mylistId: mylistId,
      });
      setSelectedMylistIdx([...selectedMyListIdx, arrayIdx]);
    } else {
      await axios.delete('/mylists/quiz', {
        data: {
          quizId,
          mylistId: mylistId,
      }});
      setSelectedMylistIdx(selectedMyListIdx.filter(idx => idx != arrayIdx));
    }
  }

  const defaultButton = (
    <Button
      classNames={{root: classes.button}}
      leftIcon={<IconPlaylistAdd />}
      variant="outline"
      size="xs"
      bg="#fff"
    >Save</Button>
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
      <MylistCreateModal 
        opened={creating} 
        onClose={create.close}
        onCreate={createMylist}
        zIndex={50}
      />
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
                key={m.id}
              >
                <Checkbox
                  label={m.name}
                  checked={selectedMyListIdx.includes(idx)}
                  onChange={() => saveToList(m.id, idx)}
                />
              </Menu.Item>
            )
          }
          <Divider/>
          <Menu.Item 
            icon={<IconPlus size={14}/>}
            onClick={create.open}
          >
            マイリストを作成
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
    
  );
}