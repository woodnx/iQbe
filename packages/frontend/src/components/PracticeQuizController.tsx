import { Button, Center, DefaultProps, Group } from "@mantine/core";
import { IconChevronsRight, IconPlaystationCircle, IconX } from "@tabler/icons-react";
import PracticeQuizButton from "./PracticeQuizButton";
import { useState } from "react";

interface Props extends DefaultProps {
  canPress?: boolean,
  canJudge?: boolean,
  onJudge: (judgement: number) => void,
  onPress: () => void,
}

export function PracticeQuizController({
  canPress = true,
  canJudge = true,
  onJudge,
  onPress,
  ...others
}: Props) {
  const [ isPressed, setIsPressed ] = useState(false);

  const pressed = () => {
    onPress();
    setIsPressed(true);
  }

  const judge = (judge: number) => {
    onJudge(judge);
    setIsPressed(false);
  }
  
  return (
    <>
      <Group position="center" grow {...others}>
        <Button fullWidth size="xl" color="red" onClick={() => judge(1)} disabled={!canJudge || !isPressed}>
          <IconPlaystationCircle/>
        </Button>
        <Button fullWidth size="xl" color="gray" onClick={() => judge(2)} disabled={!canJudge || isPressed}>
          <IconChevronsRight/>
        </Button>
        <Button fullWidth size="xl" color="blue" onClick={() => judge(0)} disabled={!canJudge || !isPressed}>
          <IconX/>
        </Button>
      </Group>
      <Center mt="sm">
        <PracticeQuizButton 
          width={280}
          onClick={pressed}
          disabled={!canPress}
        />
      </Center>
    </>
    
  )
}