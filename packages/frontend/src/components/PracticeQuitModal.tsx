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
}

export default function PracticePauseModal({ onJudge }: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useIsMobile();
  const judge = (judgement: number) => {
    onJudge(judgement);
    close();
  };

  const defaultButton = (
    <Button
      variant="outline"
      onClick={open}
      leftSection={<IconPlayerPauseFilled />}
      color="dark"
    >
      演習をやめる
    </Button>
  );

  const mobileButton = (
    <ActionIcon
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
          <Button size="lg" color="red" onClick={() => judge(1)}>
            正解にしてやめる
          </Button>
          <Button size="lg" color="gray" onClick={() => judge(2)}>
            スルーにしてやめる
          </Button>
          <Button size="lg" color="blue" onClick={() => judge(0)}>
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
