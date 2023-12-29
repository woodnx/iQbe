import { ActionIcon, Menu } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";

export default function QuizDetailsMenu() {
  return (
    <Menu withinPortal position="bottom-end">
      <Menu.Target>
        <ActionIcon>
          <IconDots/>
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item>Show Details</Menu.Item></Menu.Dropdown>
    </Menu>
  )
}