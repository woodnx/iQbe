import { Button, Card, DefaultProps, Flex, Group, Text, } from "@mantine/core";
import QuizMylistButton from "./QuizMylistButton";
import QuizFavoriteButton from "./QuizFavoriteButton";
import { Judgement, MylistInformation, Quiz } from "../types";
import { QuizWorkbookBadge } from "./QuizWorkbookBadge";
import { useState } from "react";

interface Props extends DefaultProps{
  index: number,
  quiz: Quiz,
  mylists: MylistInformation[],
  coloring?: boolean,
  isMobile?: boolean,
  isHidden?: boolean,
}

const defineColor = (judgement: Judgement) => {
  if (judgement == 0) return 'blue.1';
  else if (judgement == 1) return 'red.1'
  else return 'gray.1'
}

export default function QuizCard({
  index,
  quiz,
  mylists,
  coloring,
  isMobile = false,
  isHidden = false,
  ...others
}: Props) {
  const [ innerIsHidden, setInnerIsHidden ] = useState(isHidden);
  const color = coloring && quiz.judgement != null ? defineColor(quiz.judgement) : undefined;

  const hiddenButton = (
    <Button 
      size="xs" 
      color="violet.4"
      compact 
      onClick={() => setInnerIsHidden(false)}
    >
      Show answer
    </Button>
  )

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
        {
          innerIsHidden ? hiddenButton : quiz.answer
        }
      </Text>
      <Flex
        justify="space-between"
        align="center"
      >
        <QuizMylistButton
          quizId={quiz.id}
          registerdMylistId={quiz.registerdMylist}
          mylists={mylists}
          isMobile={isMobile}
        />
        <QuizWorkbookBadge
          workbookName={quiz.workbook}
          levelColor={quiz.level}
          date={quiz.date}
          isMobile={isMobile}
        />
      </Flex>
    </Card>
  )
}