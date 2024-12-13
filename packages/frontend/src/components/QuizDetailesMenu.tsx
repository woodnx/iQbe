import { ActionIcon, Menu, rem } from "@mantine/core";
import { IconDots, IconInfoCircle, IconPencil, IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";

interface Props {
  qid: string,
  creatorId: string,
  question: string,
  answer: string,
  wid?: string,
  tags: string[],
  category?: number,
  isPublic: boolean,
}

export default function({
  qid,
  creatorId,
  question,
  answer,
  wid,
  tags,
  category,
  isPublic,
}: Props) {
  const uid = localStorage.getItem('uid')
  const isCreated = creatorId == uid;

  return (
    <Menu withinPortal position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray">
          <IconDots/>
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconInfoCircle style={{ width: rem(14), height: rem(14) }}/>}
        >詳細を表示</Menu.Item>
        { <Menu.Item 
          disabled={!isCreated}
          leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }}/>}
          onClick={() =>
            modals.openContextModal({
              modal: 'quizEdit',
              title: 'クイズを編集',
              innerProps: {
                qid,
                question,
                answer,
                wid,
                tags,
                category,
                isPublic,
              },
              size: 'xl',
              zIndex: 200
          })}
        >編集</Menu.Item>
        }
        <Menu.Item
          leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }}/>}
          onClick={() =>
            modals.openContextModal({
              modal: 'quizDelete',
              title: 'クイズを削除',
              innerProps: {
                qid,
              },
              size: 'md',
              zIndex: 200
          })}
        >
          削除
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}