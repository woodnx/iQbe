import { Button, Center, DefaultProps, Group } from "@mantine/core";
import { IconChevronsRight, IconPlaystationCircle, IconX } from "@tabler/icons-react";
import PracticeQuizButton from "./PracticeQuizButton";

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
  return (
    <>
      <Group position="center" grow {...others}>
        <Button fullWidth size="xl" color="red" onClick={() => onJudge(1)} disabled={!canJudge}>
          <IconPlaystationCircle/>
        </Button>
        <Button fullWidth size="xl" color="gray" onClick={() => onJudge(2)} disabled={!canJudge}>
          <IconChevronsRight/>
        </Button>
        <Button fullWidth size="xl" color="blue" onClick={() => onJudge(0)} disabled={!canJudge}>
          <IconX/>
        </Button>
      </Group>
      <Center mt="sm">
        <PracticeQuizButton 
          width={280}
          onClick={onPress}
          disabled={!canPress}
        />
      </Center>
    </>
    
  )
}