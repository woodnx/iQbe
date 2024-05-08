import { useState } from "react";
import { Button, Card, BoxProps, Flex, Group, Text, } from "@mantine/core";
import { Judgement, MylistInformation, Quiz } from "@/types";
import QuizMylistButton from "./QuizMylistButton";
import QuizFavoriteButton from "./QuizFavoriteButton";
import { QuizWorkbookBadge } from "./QuizWorkbookBadge";
import QuizDetailsMenu from "./QuizDetailesMenu";

interface Props extends BoxProps{
  index: number,
  quiz: Quiz,
  mylists: MylistInformation[],
  coloring?: boolean,
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
  isHidden = false,
  ...others
}: Props) {
  const [ innerIsHidden, setInnerIsHidden ] = useState(isHidden);
  const color = coloring && quiz.judgement != null ? defineColor(quiz.judgement) : undefined;

  const hiddenButton = (
    <Button 
      size="compact-xs" 
      color="violet.4"
      onClick={() => setInnerIsHidden(false)}
    >
      Show answer
    </Button>
  )

  return (
    <Card 
      withBorder 
      bg={color}
      {...others}
    >
      <Group justify="space-between">
        <Text>No.{index}</Text>
        <QuizFavoriteButton
          isFavorite={quiz.isFavorite}
          quizId={quiz.id}
        />
      </Group>
      <Text pt={10}>{quiz.question}</Text>
      <Text ta="right" pt={10}>
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
        />
        <Group>
          {
            (!!quiz.workbook) 
            ?
            <QuizWorkbookBadge
              workbookName={quiz.workbook}
              levelColor={quiz.level || 'dark'}
              date={quiz.date}
            />
            :
            null 
          }
          <QuizDetailsMenu
            quizId={quiz.id}
            creatorId={quiz.creatorId}
            question={quiz.question}
            answer={quiz.answer}
            workbook={quiz.wid}
            category={quiz.category}
            subCategory={quiz.subCategory}
            isPublic={!!quiz.isPublic}
          />
        </Group>
      </Flex>
    </Card>
  )
}