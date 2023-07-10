import { Button } from "@mantine/core"
import { IconArrowsShuffle } from "@tabler/icons-react"

interface QuizShuffleButton {
  apply: (seed: number) => void
}

export default function QuizShuffleButton({ apply }: QuizShuffleButton) {
  const random = Math.floor(Math.random() * 100000);

  return (
    <Button
      leftIcon={<IconArrowsShuffle/>}
      onClick={() => apply(random)}
      variant="outline"
      color="blue"
    >Shuffle</Button>
  )
}