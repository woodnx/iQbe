import { useState } from "react";
import { Button, Card, BoxProps, Flex, Group, Text, } from "@mantine/core";
import QuizMylistButton from "./QuizMylistButton";
import QuizFavoriteButton from "./QuizFavoriteButton";
import { QuizWorkbookBadge } from "./QuizWorkbookBadge";
import QuizDetailsMenu from "./QuizDetailesMenu";
import { components } from "api/schema";

type Quiz = components['schemas']['Quiz'];

interface Props extends BoxProps{
  index: number,
  quiz: Quiz,
  coloring?: boolean,
  isHidden?: boolean,
}

const defineColor = (judgement: number) => {
  if (judgement == 0) return 'blue.1';
  else if (judgement == 1) return 'red.1'
  else return 'gray.1'
}

export default function QuizCard({
  index,
  quiz,
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
      解答を表示
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
          qid={quiz.qid}
          key={quiz.qid}
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
          qid={quiz.qid}
          registerdMylists={quiz.registerdMylist || []}
        />
        <Group>
          {
            (!!quiz.workbook) 
            ?
            <QuizWorkbookBadge
              workbook={quiz.workbook}
              levelColor='dark'
            />
            :
            null 
          }
          <QuizDetailsMenu
            quiz={quiz}
          />
        </Group>
      </Flex>
    </Card>
  )
}