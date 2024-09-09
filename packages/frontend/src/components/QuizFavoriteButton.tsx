import { useState } from "react";
import { ActionIcon } from "@mantine/core";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import api from "@/plugins/api";

interface QuizFavoriteButtonProps {
  isFavorite: boolean,
  qid: string
}

export default function QuizFavoriteButton({ 
  isFavorite: innerIsFavorite, 
  qid,
}: QuizFavoriteButtonProps) {
  const [ isFavorite, setFavorite ] = useState(innerIsFavorite);
  
  const addFavoriteList = async () => {
    if (isFavorite) {
      try {
        await api.quizzes.favorite.$delete({ body: {
          qid,
        }});
        setFavorite(!isFavorite);
      } catch(e) {
        return;
      }
    }else {
      try {
        await api.quizzes.favorite.$post({ body: {
          qid
        }});
        setFavorite(!isFavorite);
      } catch(e) {
        return;
      }
    }
  };

  return (
    <ActionIcon 
      color={isFavorite ? 'yellow.5' : 'gray'}
      onClick={addFavoriteList} 
      variant="subtle"
    >
      {isFavorite ? <IconStarFilled/> : <IconStar/>}
    </ActionIcon>
  );
}