import { components } from "api/schema";
import { ComponentProps, useState } from "react";

import { useIsMobile } from "@/contexts/isMobile";
import { $api } from "@/utils/client";
import { ActionIcon, Button, Checkbox, Divider, Menu } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconPlaylistAdd, IconPlus } from "@tabler/icons-react";

import classes from "./styles/QuizMylistButton.module.css";

type Mylist = components["schemas"]["Mylist"];

interface Props extends ComponentProps<typeof Button> {
  qid: string;
  registerdMylists: Mylist[];
}

export default function QuizMylistButton({ qid, registerdMylists }: Props) {
  const { data: mylists } = $api.useQuery("get", "/mylists");
  const [selectedMids, setSelectedMids] = useState(
    registerdMylists.map((mylist) => mylist.mid),
  );
  const isMobile = useIsMobile();
  const { mutate: addQuizToMylist } = $api.useMutation("post", "/register");
  const { mutate: deleteQuizFromMylist } = $api.useMutation(
    "post",
    "/unregister",
  );

  const saveToList = async (mid: string) => {
    try {
      if (!selectedMids.includes(mid)) {
        // add quiz into mylist
        addQuizToMylist({
          body: {
            qid,
            mid,
          },
        });
        setSelectedMids([...selectedMids, mid]);
        notifications.show({
          title: "マイリストに追加",
          message: "マイリストにクイズを追加しました",
        });
      } else {
        // delete quiz from mylist
        deleteQuizFromMylist({
          body: {
            qid,
            mid,
          },
        });
        setSelectedMids(selectedMids.filter((_mid) => _mid != mid));
        notifications.show({
          title: "マイリストから削除",
          message: "マイリストからクイズを削除しました",
        });
      }
    } catch (e) {
      notifications.show({
        title: "何らかの障害が発生しました",
        message: "何度も続く場合はサポート担当に問い合わせてください",
        color: "red",
      });
      return;
    }
  };

  const defaultButton = (
    <Button
      classNames={{ root: classes.button }}
      leftSection={<IconPlaylistAdd />}
      variant="outline"
      size="xs"
      bg="#fff"
    >
      追加
    </Button>
  );

  const mobileButton = (
    <ActionIcon size="md" color="blue" variant="light">
      <IconPlaylistAdd />
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
        <Menu.Target>{isMobile ? mobileButton : defaultButton}</Menu.Target>
        <Menu.Dropdown>
          {mylists?.map((m) => (
            <Menu.Item key={m.mid}>
              <Checkbox
                label={m.name}
                checked={selectedMids.includes(m.mid)}
                onChange={() => saveToList(m.mid)}
              />
            </Menu.Item>
          ))}
          <Divider />
          <Menu.Item
            leftSection={<IconPlus size={14} />}
            onClick={() => {
              modals.openContextModal({
                modal: "mylistCreate",
                title: "マイリストを新規作成",
                innerProps: {
                  qid,
                },
                size: "md",
                centered: true,
                zIndex: 10000,
              });
            }}
          >
            マイリストを作成
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
}
