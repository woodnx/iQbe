import { ActionIcon, BoxProps, Button } from "@mantine/core";
import { IconArrowAutofitContent } from "@tabler/icons-react";
import { useIsMobile } from "@/contexts/isMobile";

interface Props extends BoxProps {
  apply: () => void;
  disabled?: boolean;
}

export default function ({ apply, disabled, ...others }: Props) {
  const isMobile = useIsMobile();
  const Icon = () => <IconArrowAutofitContent />;
  const color = "green";

  const DefaultButton = () => (
    <Button
      onClick={() => apply()}
      leftSection={<Icon />}
      radius="md"
      variant="light"
      color={color}
      disabled={disabled}
      {...others}
    >
      演習に転送
    </Button>
  );

  const MobileButton = () => (
    <ActionIcon
      onClick={() => apply()}
      size="lg"
      radius="xl"
      variant="light"
      color={color}
      disabled={disabled}
    >
      <Icon />
    </ActionIcon>
  );

  return isMobile ? <MobileButton /> : <DefaultButton />;
}
