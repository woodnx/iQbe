import { useIsMobile } from "@/contexts/isMobile";
import { ActionIcon, Button, BoxProps } from "@mantine/core";
import { IconArrowAutofitContent } from "@tabler/icons-react";

interface Props extends BoxProps {
  apply: () => void
}

export default function({
  apply,
  ...others
}: Props) {
  const isMobile = useIsMobile();
  const Icon = () => <IconArrowAutofitContent/>;
  const color = "green"

  const DefaultButton = () => (
    <Button
      onClick={() => apply()}
      leftSection={<Icon/>}
      variant="outline"
      color={color}
      { ...others }
    >Transfar</Button>
  );

  const MobileButton = () => (
    <ActionIcon
      onClick={() => apply()}
      size="lg" 
      radius="xl" 
      variant="outline"
      color={color}
    >
      <Icon/>
    </ActionIcon>
  )

  return (
    isMobile ? <MobileButton/> : <DefaultButton />
  )
}