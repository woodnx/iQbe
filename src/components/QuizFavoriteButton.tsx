import { ActionIcon } from "@mantine/core";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { useState } from "react";

export default function QuizFavoriteButton() {
  const [ isFavorite, setFavorite ] = useState(false)

  return (
    <ActionIcon 
      color={isFavorite ? 'yellow.5' : 'gray'}
      onClick={() => setFavorite(!isFavorite)} 
    >
      {isFavorite ? <IconStarFilled/> : <IconStar/>}
    </ActionIcon>
  )
}