import { ComponentProps, useState } from "react";
import { ActionIcon, Button, Checkbox, Divider, Menu } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlaylistAdd, IconPlus } from "@tabler/icons-react";
import classes from "./styles/QuizMylistButton.module.css";
import { MylistInformation } from "@/types";
import { useIsMobile } from "@/contexts/isMobile";
import MylistCreateModal from "./MylistCreateModal";
import { $api } from "@/utils/client";

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
  const [ creating, create ] = useDisclosure(false);
  const [ selectedMyListIdx, setSelectedMylistIdx ] = useState(registerdMylistId.map(id => mylists?.findIndex(list => list.mid == id)));
  const isMobile = useIsMobile();
  const { mutate: addMylist } = $api.useMutation("post", "/mylists");
  const { mutate: addQuizToMylist } = $api.useMutation("post", "/register");
  const { mutate: deleteQuizFromMylist } = $api.useMutation("post", "/unregister")

  const createMylist = async (mylistname: string) => {
    try {
      addMylist({ body: {
        listName: mylistname,
      }}, {
        onSuccess: (({ mid }) => {
          addQuizToMylist({
            body: { 
              qid,
              mid,
            },
          });
        }),
      });
    } catch(e) {
      return;
    }
  };

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
      } 
      else {  // delete quiz from mylist
        deleteQuizFromMylist({ 
          body: { 
            qid,
            mid,
          },
        });
        setSelectedMylistIdx(selectedMyListIdx.filter(idx => idx != arrayIdx));
      }
    } catch(e) {
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
            onClick={create.open}
          >
            マイリストを作成
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
    
  );
}