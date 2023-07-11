import { Button, DefaultProps } from "@mantine/core"
import { IconArrowsShuffle } from "@tabler/icons-react"

interface QuizShuffleButton extends DefaultProps {
  apply: (seed: number) => void
}

export default function QuizShuffleButton({ apply, ...others }: QuizShuffleButton) {
  const random = Math.floor(Math.random() * 100000);

  return (
    <Button
      leftIcon={<IconArrowsShuffle/>}
      onClick={() => apply(random)}
      variant="outline"
      color="blue"
      { ...others }
    >Shuffle</Button>
  )
}