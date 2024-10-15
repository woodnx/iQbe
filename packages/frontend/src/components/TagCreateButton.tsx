import { useIsMobile } from "@/contexts/isMobile";
import { ActionIcon, Button, ButtonProps } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

export interface TagCreateButtonProps extends ButtonProps {
  onClick?: () => void
}

export default function TagCreateButton({ 
  onClick,
}: TagCreateButtonProps) {
  const isMobile = useIsMobile();

  const DefaultButton = () => (
    <Button onClick={onClick}>
      新規作成
    </Button>
  );

  const MobileButton = () => (
    <ActionIcon onClick={onClick}>
      <IconPlus />
    </ActionIcon>
  );

  return (
    isMobile ? <MobileButton /> : <DefaultButton />
  )
}