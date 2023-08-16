import { Card, DefaultProps, Group, Overlay, Text } from "@mantine/core";
import QuizFavoriteButton from "./QuizFavoriteButton";
import { QuizWorkbookBadge } from "./QuizWorkbookBadge";
import QuizMylistButton from "./QuizMylistButton";

interface Props extends DefaultProps {
  quizId: number,
  answer: string,
  workbookName: string,
  levelColor: string,
  date: string,
  isFavorite: boolean,
  visible: boolean,
}

export function PracticeQuizInfo({
  quizId,
  answer,
  workbookName,
  levelColor,
  date,
  isFavorite,
  visible,
  ...other
}: Props) {
  return (
    <Card p="sm" radius="sm" { ...other }>
      <Group position="apart">
        <Text fz="xl" fw="bold">{answer}</Text>
        <QuizFavoriteButton 
          quizId={quizId}
          isFavorite={isFavorite}
        />
      </Group>
      <Group position="apart" m={0} mt="sm">
        <QuizMylistButton/>
        <QuizWorkbookBadge
          workbookName={workbookName}
          levelColor={levelColor}
          date={date}
          size="lg"
        />
      </Group>
      { !visible ? <Overlay blur={50} color="#fff" zIndex={100}/> : null }
    </Card>
  )
}