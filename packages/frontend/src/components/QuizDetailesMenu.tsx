import { ActionIcon, Menu } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";
import { modals } from "@mantine/modals";

interface Props {
  quizId: number,
  creatorId: string,
  question: string,
  answer: string,
  workbook: string,
  category?: number | null,
  subCategory?: number | null,
  isPublic: boolean,
}

export default function({
  quizId,
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
                quizId,
                question,
                answer,
                workbook,
                category,
                subCategory,
                isPublic,
              },
              size: 'xl',
          })}
        >Edit</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}