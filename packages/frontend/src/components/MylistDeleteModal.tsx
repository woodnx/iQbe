import {
  ActionIcon,
  Button,
  BoxProps,
  Group,
  Modal,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { useIsMobile } from "@/contexts/isMobile";
import classes from "./styles/MylistModal.module.css";

interface Props extends BoxProps {
  onDelete: () => void;
}

export default function MylistDeleteModal({ onDelete }: Props) {
  const [opened, { open, close }] = useDisclosure();
  const isMobile = useIsMobile();
  const icon = <IconTrash />;

  const del = () => {
    onDelete();
    close();
  };

  const defaultButton = (
    <Button
      className={classes.button}
      variant="outline"
      radius="xl"
      leftSection={icon}
      onClick={open}
    >
      削除
    </Button>
  );

  const mobileButton = (
    <ActionIcon
      className={classes.mobileButton}
      size="lg"
      color="blue"
      variant="subtle"
      onClick={open}
    >
      {icon}
    </ActionIcon>
  );

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="マイリストの削除"
        size={isMobile ? "xs" : "md"}
        centered
      >
        <Text>マイリストを削除しますか？</Text>
        <Text c="red" size="sm">
          ※この変更は元に戻せません。
        </Text>
        <Group justify="space-between" mt="sm">
          <Button variant="outline" color="dark" onClick={close}>
            キャンセル
          </Button>
          <Button color="red" onClick={del} leftSection={icon}>
            削除
          </Button>
        </Group>
      </Modal>
      {isMobile ? mobileButton : defaultButton}
    </>
  );
}
