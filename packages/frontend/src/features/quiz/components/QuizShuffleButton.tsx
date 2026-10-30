import { ActionIcon, BoxProps, Button } from "@mantine/core";
import { IconArrowsShuffle } from "@tabler/icons-react";
import { useIsMobile } from "@/contexts/isMobile";

interface QuizShuffleButton extends BoxProps {
  apply: (seed: number) => void;
}

export default function QuizShuffleButton({
  apply,
  ...others
}: QuizShuffleButton) {
  const random = Math.floor(Math.random() * 100000);
  const isMobile = useIsMobile();

  const defaultButton = (
    <Button
      onClick={() => apply(random)}
      leftSection={<IconArrowsShuffle />}
      variant="light"
      radius="md"
      color="blue"
      {...others}
    >
      シャッフル
    </Button>
  );

  const mobileButton = (
    <ActionIcon
      onClick={() => apply(random)}
      size="lg"
      radius="xl"
      variant="light"
      color="blue"
    >
      <IconArrowsShuffle />
    </ActionIcon>
  );

  return isMobile ? mobileButton : defaultButton;
}
