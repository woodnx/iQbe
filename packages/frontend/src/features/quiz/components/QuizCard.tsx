import { BoxProps, Button, Card, Flex, Group, Text } from "@mantine/core";
import { components } from "api/schema";
import { useState } from "react";
import QuizDetailsMenu from "./QuizDetailesMenu";
import QuizFavoriteButton from "./QuizFavoriteButton";
import QuizMylistButton from "./QuizMylistButton";
import { QuizWorkbookBadge } from "./QuizWorkbookBadge";

type Quiz = components["schemas"]["Quiz"];

interface Props extends BoxProps {
  index: number;
  quiz: Quiz;
  coloring?: boolean;
  isHidden?: boolean;
}

const defineColor = (judgement: number) => {
  if (judgement == 0) return "4px solid blue.2";
  else if (judgement == 1) return "4px solid red.2";
  else return "4px solid gray.5";
};

export default function QuizCard({
  index,
  quiz,
  coloring,
  isHidden = false,
  ...others
}: Props) {
  const [innerIsHidden, setInnerIsHidden] = useState(isHidden);
  const color =
    coloring && quiz.judgement != null
      ? defineColor(quiz.judgement)
      : undefined;

  const hiddenButton = (
    <Button
      size="compact-xs"
      color="violet.4"
      onClick={() => setInnerIsHidden(false)}
    >
      解答を表示
    </Button>
  );

  return (
    <Card radius="lg" bd={color} {...others}>
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
        {innerIsHidden ? hiddenButton : quiz.answer}
      </Text>
      <Flex justify="space-between" align="center">
        <QuizMylistButton
          qid={quiz.qid}
          registerdMylists={quiz.registerdMylist || []}
        />
        <Group>
          {!!quiz.workbook ? (
            <QuizWorkbookBadge workbook={quiz.workbook} />
          ) : null}
          <QuizDetailsMenu quiz={quiz} />
        </Group>
      </Flex>
    </Card>
  );
}
