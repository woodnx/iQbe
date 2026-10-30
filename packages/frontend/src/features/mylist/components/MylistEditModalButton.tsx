import { ActionIcon, Button } from "@mantine/core";

import classes from "./styles/MylistModal.module.css";
import { Icon, IconPencil } from "@tabler/icons-react";
import { useIsMobile } from "@/contexts/isMobile";

export interface MylistEditModalButtonProps {
  icon?: Icon;
  label?: string;
  onClick?: () => void;
}

const MylistEditModalButton = ({
  icon: Icon = IconPencil,
  label = "編集",
  onClick = () => {},
}: MylistEditModalButtonProps) => {
  const isMobile = useIsMobile();
  // const icon = <IconPencil />;

  const DefaultButton = () => (
    <Button
      className={classes.button}
      variant="outline"
      radius="xl"
      leftSection={<Icon />}
      onClick={onClick}
    >
      {label}
    </Button>
  );

  const MobileButton = () => (
    <ActionIcon
      className={classes.mobileButton}
      size="lg"
      color="blue"
      variant="subtle"
      onClick={onClick}
    >
      <Icon />
    </ActionIcon>
  );

  return isMobile ? <MobileButton /> : <DefaultButton />;
};

export default MylistEditModalButton;
