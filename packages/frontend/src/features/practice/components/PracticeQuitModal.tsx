import {
  ActionIcon,
  BoxProps,
  Button,
  Modal,
  Space,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlayerPauseFilled } from "@tabler/icons-react";
import { useIsMobile } from "@/contexts/isMobile";

interface Props extends BoxProps {
  onJudge: (judgement: number) => void;
  disabled?: boolean;
}

export default function PracticePauseModal({
  onJudge,
  disabled = false,
}: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useIsMobile();
  const judge = (judgement: number) => {
    if (disabled) return;
    onJudge(judgement);
    close();
  };

  const defaultButton = (
    <Button
      variant="outline"
      disabled={disabled}
      onClick={open}
      leftSection={<IconPlayerPauseFilled />}
      color="dark"
    >
      演習をやめる
    </Button>
  );

  const mobileButton = (
    <ActionIcon
      disabled={disabled}
      onClick={open}
      size="lg"
      radius="xl"
      variant="outline"
      color="dark"
    >
      <IconPlayerPauseFilled />
    </ActionIcon>
  );

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => close()}
        size={isMobile ? "xs" : "md"}
      >
        <Space h={10} />
        <Stack gap="md" h={300}>
          <Button
            disabled={disabled}
            size="lg"
            color="red"
            onClick={() => judge(1)}
          >
            正解にしてやめる
          </Button>
          <Button
            disabled={disabled}
            size="lg"
            color="gray"
            onClick={() => judge(2)}
          >
            スルーにしてやめる
          </Button>
          <Button
            disabled={disabled}
            size="lg"
            color="blue"
            onClick={() => judge(0)}
          >
            誤答にしてやめる
          </Button>
          <Button size="lg" variant="outline" color="gray" onClick={close}>
            クイズに戻る
          </Button>
        </Stack>
      </Modal>
      {isMobile ? mobileButton : defaultButton}
    </>
  );
}
