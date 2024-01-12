import { useIsMobile } from "@/contexts/isMobile";
import { ActionIcon, Button, DefaultProps } from "@mantine/core";
import { IconArrowAutofitContent } from "@tabler/icons-react";

interface Props extends DefaultProps {
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
      leftIcon={<Icon/>}
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