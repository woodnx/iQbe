import { useState } from "react";
import { ActionIcon } from "@mantine/core";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { $api } from "@/utils/client";

interface QuizFavoriteButtonProps {
  isFavorite: boolean,
  qid: string
}

export default function QuizFavoriteButton({ 
  isFavorite: innerIsFavorite, 
  qid,
}: QuizFavoriteButtonProps) {
  const [ isFavorite, setFavorite ] = useState(innerIsFavorite);
  const { mutate: like } = $api.useMutation("post", "/like");
  const { mutate: unlike } = $api.useMutation("post", "/unlike");
  
  const addFavoriteList = async () => {
    if (isFavorite) {
      try {
        unlike({ body: {
          qid,
        }});
        setFavorite(!isFavorite);
      } catch(e) {
        return;
      }
    }else {
      try {
        like({ body: {
          qid,
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