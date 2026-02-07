import {
  ActionIcon,
  Badge,
  BoxProps,
  Card,
  Group,
  Menu,
  rem,
  Text,
} from "@mantine/core";
import { IconDots, IconPencil, IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { useNavigate } from "@tanstack/react-router";
import { components } from "api/schema";
import dayjs from "dayjs";
import { useAuth } from "@/hooks/useAuth";

type Workbook = components["schemas"]["Workbook"];

interface Props extends BoxProps {
  workbook: Workbook;
}

export default function WorkbookCard({ workbook }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const uid = user.uid;

  return (
    <Card px="lg" py="sm" radius="lg" withBorder>
      <Group my={10} justify="space-between">
        <Text
          fw={700}
          truncate
          onClick={(e) => {
            e.preventDefault();
            navigate({ to: "/workbook/$wid", params: { wid: `${workbook.wid}` } });
          }}
          component="a"
          href=""
        >
          {workbook.name}
        </Text>
        <Group>
          {workbook.date && (
            <Badge color="gray">{dayjs(workbook.date).year()}</Badge>
          )}
          {uid == workbook.creatorId && (
            <Menu withinPortal position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                  <IconDots />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={
                    <IconPencil style={{ width: rem(14), height: rem(14) }} />
                  }
                  onClick={() =>
                    modals.openContextModal({
                      modal: "workbookEdit",
                      title: "問題集の編集",
                      innerProps: {
                        wid: workbook.wid,
                        name: workbook.name,
                        date: workbook?.date || undefined,
                      },
                      size: "md",
                      zIndex: 200,
                    })
                  }
                >
                  編集
                </Menu.Item>
                <Menu.Item
                  leftSection={
                    <IconTrash style={{ width: rem(14), height: rem(14) }} />
                  }
                  onClick={() =>
                    modals.openContextModal({
                      modal: "workbookDelete",
                      title: "問題集を削除",
                      innerProps: {
                        wid: workbook.wid,
                      },
                      size: "md",
                      zIndex: 200,
                    })
                  }
                >
                  削除
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Group>
    </Card>
  );
}
