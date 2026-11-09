import { ActionIcon, Button } from "@mantine/core";

import { useIsMobile } from "@/contexts/isMobile";
import { Icon, IconPencil } from "@tabler/icons-react";
import classes from "./styles/MylistModal.module.css";

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
      color="dark"
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
      color="dark"
      variant="subtle"
      onClick={onClick}
    >
      <Icon />
    </ActionIcon>
  );

  return isMobile ? <MobileButton /> : <DefaultButton />;
};

export default MylistEditModalButton;
