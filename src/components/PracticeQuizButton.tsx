import { DefaultProps } from "@mantine/core";
import defaultImg from '../assets/quiz_button.png'
import pressingImg from '../assets/quiz_button_pressing.png'
import disabledImg from '../assets/quiz_button_disable.png'
import { useState } from "react";

interface PracticeQuizButtonProps extends DefaultProps{
  onClick?: () => void,
  disabled?: boolean,
}

export default function PracticeQuizButton({ 
  onClick = () => {}, 
  disabled,
}: PracticeQuizButtonProps) {
  const [ image, setImage ] = useState(!!disabled ? disabledImg : defaultImg)
  
  const press = () => {
    onClick()
    setImage(pressingImg)
  }

  const unpress = () => {
    setImage(defaultImg)
  }

  return (
    <>
    { 
    !!disabled ? 
      <img src={image} alt="image"/> 
    :
      <div 
        onMouseDown={press}
        onMouseUp={unpress}
      >
        <img src={image} alt="image"/>
      </div>
    }
    </>
    
  )
}