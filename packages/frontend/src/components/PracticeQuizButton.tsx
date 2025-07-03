import { Image, ImageProps } from "@mantine/core";
import { useState } from "react";
import defaultImg from "@/assets/quiz_button.png";
import disabledImg from "@/assets/quiz_button_disable.png";
import pressingImg from "@/assets/quiz_button_pressing.png";

interface Props extends ImageProps {
  onClick?: () => void;
  disabled?: boolean;
}

export default function PracticeQuizButton({
  onClick = () => {},
  disabled = false,
  ...others
}: Props) {
  const [image, setImage] = useState(defaultImg);

  const press = () => {
    setImage(pressingImg);
  };

  const unpress = () => {
    onClick();
    setImage(defaultImg);
  };

  return (
    <>
      {disabled ? (
        <Image src={disabledImg} alt="image" {...others} />
      ) : (
        <Image
          onMouseDown={press}
          onMouseUp={unpress}
          src={image}
          alt="image"
          {...others}
        />
      )}
    </>
  );
}
