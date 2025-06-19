import { ActionIcon, Menu, rem, ScrollArea } from "@mantine/core";
import {
  IconDots,
  IconInfoCircle,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { components } from "api/schema";

type Quiz = components["schemas"]["Quiz"];

interface Props {
  quiz: Quiz;
}

export default function ({ quiz }: Props) {
  const {
    qid,
    question,
    answer,
    workbook,
    tags,
    category,
    isPublic,
    creatorId,
  } = quiz;
  const uid = localStorage.getItem("uid");
  const isCreated = creatorId == uid;

  return (
    <Menu withinPortal position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray">
          <IconDots />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={
            <IconInfoCircle style={{ width: rem(14), height: rem(14) }} />
          }
          onClick={() =>
            modals.openContextModal({
              modal: "quizDetailes",
              title: "クイズの詳細",
              innerProps: {
                quiz,
              },
              size: "xl",
              zIndex: 200,
              scrollAreaComponent: ScrollArea.Autosize,
            })
          }
        >
          詳細を表示
        </Menu.Item>
        {isCreated && (
          <Menu.Item
            leftSection={
              <IconPencil style={{ width: rem(14), height: rem(14) }} />
            }
            onClick={() =>
              modals.openContextModal({
                modal: "quizEdit",
                title: "クイズを編集",
                innerProps: {
                  qid,
                  question,
                  answer,
                  wid: workbook?.wid,
                  tags: tags?.map((tag) => tag.label),
                  category: category || undefined,
                  isPublic,
                },
                size: "xl",
                zIndex: 200,
              })
            }
          >
            編集
          </Menu.Item>
        )}
        {isCreated && (
          <Menu.Item
            leftSection={
              <IconTrash style={{ width: rem(14), height: rem(14) }} />
            }
            onClick={() =>
              modals.openContextModal({
                modal: "quizDelete",
                title: "クイズを削除",
                innerProps: {
                  qid,
                },
                size: "md",
                zIndex: 200,
              })
            }
          >
            削除
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
