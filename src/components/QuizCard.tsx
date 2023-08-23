import { Card, DefaultProps, Flex, Group, Text, } from "@mantine/core";
import QuizMylistButton from "./QuizMylistButton";
import QuizFavoriteButton from "./QuizFavoriteButton";
import { Judgement, Quiz } from "../types";
import { QuizWorkbookBadge } from "./QuizWorkbookBadge";

interface Props extends DefaultProps{
  index: number,
  quiz: Quiz,
  coloring?: boolean,
}

const defineColor = (judgement: Judgement) => {
  if (judgement == 0) return 'blue.1';
  else if (judgement == 1) return 'red.1'
  else return 'gray.1'
}

export default function QuizCard({
  index,
  quiz,
  coloring,
  ...others
}: Props) {
  const color = coloring && quiz.judgement != null ? defineColor(quiz.judgement) : undefined;
  return (
    <Card withBorder bg={color} {...others}>
      <Group position="apart">
        <Text>No.{index}</Text>
        <QuizFavoriteButton
          isFavorite={quiz.isFavorite}
          quizId={quiz.id}
        />
      </Group>
      <Text pt={10}>{quiz.question}</Text>
      <Text align="right" pt={10}>
        {quiz.answer}
      </Text>
      <Flex
        justify="space-between"
        align="center"
      >
        <QuizMylistButton 
          quizId={quiz.id}
          registerdMylistId={quiz.registerdMylist}
        />
        <QuizWorkbookBadge
          workbookName={quiz.workbook}
          levelColor={quiz.level}
          date={quiz.date}
          size="lg"
        />
      </Flex>
    </Card>
  )
}