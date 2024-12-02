import { ActionIcon, Menu } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";
import { modals } from "@mantine/modals";

interface Props {
  qid: string,
  creatorId: string,
  question: string,
  answer: string,
  wid?: string,
  tags: string[],
  category?: number,
  subCategory?: number,
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
  subCategory,
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
        <Menu.Item>詳細を表示</Menu.Item>
        <Menu.Item 
          disabled={!isCreated}
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
                subCategory,
                isPublic,
              },
              size: 'xl',
              zIndex: 200
          })}
        >クイズを編集</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}