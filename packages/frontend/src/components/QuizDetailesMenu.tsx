import { ActionIcon, Menu } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";
import { modals } from "@mantine/modals";

interface Props {
  qid: string,
  creatorId: string,
  question: string,
  answer: string,
  workbook: string,
  category?: number,
  subCategory?: number,
  isPublic: boolean,
}

export default function({
  qid,
  creatorId,
  question,
  answer,
  workbook,
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
        <Menu.Item>Show Details</Menu.Item>
        <Menu.Item 
          disabled={!isCreated}
          onClick={() =>
            modals.openContextModal({
              modal: 'quizEdit',
              title: 'Edit Quiz',
              innerProps: {
                qid,
                question,
                answer,
                workbook,
                category,
                subCategory,
                isPublic,
              },
              size: 'xl',
              zIndex: 100
          })}
        >Edit</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}