import { ActionIcon, Button, DefaultProps } from "@mantine/core";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useIsMobile } from "@/contexts/isMobile";

interface Props extends DefaultProps {
  isHidden: boolean,
  onToggle: (isHidden: boolean) => void,
}

export default function QuizHiddenAnswerButton({
  isHidden,
  onToggle,
  ...others
}: Props) {
  const isMobile = useIsMobile();
  const icon = isHidden ?  <IconEye/> : <IconEyeOff/>;
  const message = isHidden ? 'All Show' : 'All Hide';
  const color = 'violet';

  const innerOnToggle = () => {
    onToggle(!isHidden);
  }

  const defaultButton = (
    <Button
      onClick={() => innerOnToggle()}
      leftIcon={icon}
      variant="outline"
      color={color}
      { ...others }
    >{ message }</Button>
  );

  const mobileButton = (
    <ActionIcon
      onClick={() => innerOnToggle()}
      size="lg" 
      radius="xl" 
      variant="outline"
      color={color}
    >
      { icon }
    </ActionIcon>
  )
  return (
    isMobile ? mobileButton : defaultButton
  )
}