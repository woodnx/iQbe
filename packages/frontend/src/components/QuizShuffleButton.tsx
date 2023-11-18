import { ActionIcon, Button, DefaultProps } from "@mantine/core"
import { IconArrowsShuffle } from "@tabler/icons-react"
import { useIsMobile } from "@/contexts/isMobile";

interface QuizShuffleButton extends DefaultProps {
  apply: (seed: number) => void
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
      leftIcon={<IconArrowsShuffle/>}
      variant="outline"
      color="blue"
      { ...others }
    >Shuffle</Button>
  );

  const mobileButton = (
    <ActionIcon 
      onClick={() => apply(random)}
      size="lg" 
      radius="xl" 
      variant="outline"
      color="blue"
    >
      <IconArrowsShuffle/>
    </ActionIcon>
  )


  return (
    isMobile ? mobileButton : defaultButton
  )
}