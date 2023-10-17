import { ActionIcon } from "@mantine/core";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { useState } from "react";
import axios from "../plugins/axios";

interface QuizFavoriteButtonProps {
  isFavorite: boolean,
  quizId: number
}

export default function QuizFavoriteButton({ 
  isFavorite: innerIsFavorite, 
  quizId 
}: QuizFavoriteButtonProps) {
  const [ isFavorite, setFavorite ] = useState(innerIsFavorite)

  const addFavoriteList = async () => {
    if (isFavorite) {
      const status = await axios.delete('/favorites', { data: { quizId } }).then(res => res.status)
      if (status === 204) setFavorite(!isFavorite)
    }else {
      const status = await axios.post('/favorites', { quizId }).then(res => res.status)
      if (status === 201) setFavorite(!isFavorite)
    }
  }

  return (
    <ActionIcon 
      color={isFavorite ? 'yellow.5' : 'gray'}
      onClick={addFavoriteList} 
    >
      {isFavorite ? <IconStarFilled/> : <IconStar/>}
    </ActionIcon>
  )
}