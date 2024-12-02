import { ActionIcon, Button } from "@mantine/core";

import classes from './styles/MylistModal.module.css';
import { IconPencil } from "@tabler/icons-react";
import { useIsMobile } from "@/contexts/isMobile";

export interface MylistEditModalButtonProps {
  onClick?: () => void,
}

const MylistEditModalButton = ({
  onClick = () => {}
}: MylistEditModalButtonProps) => {
  const isMobile = useIsMobile();
  const icon = <IconPencil />;

  const DefaultButton = () => (
    <Button
      className={classes.button}
      variant="outline" 
      radius="xl" 
      leftSection={icon}
      onClick={onClick}
    >編集</Button>
  );

  const MobileButton = () => (
    <ActionIcon
      className={classes.mobileButton}
      size="lg" 
      color="blue"
      variant="subtle"
      onClick={onClick}
    >
      { icon }
    </ActionIcon>
  );

  return (
    isMobile ? <MobileButton /> : <DefaultButton />
  );
}

export default MylistEditModalButton;