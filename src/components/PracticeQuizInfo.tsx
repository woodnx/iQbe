import { Card, DefaultProps, Group, Overlay, Text } from "@mantine/core";
import QuizFavoriteButton from "./QuizFavoriteButton";
import { QuizWorkbookBadge } from "./QuizWorkbookBadge";
import QuizMylistButton from "./QuizMylistButton";
import { Quiz } from "../types";
import { useIsMobile } from "../hooks";
import { useMylistInfomations } from "../hooks/useMylists";

interface Props extends DefaultProps {
  quiz: Quiz
  visible: boolean,
}

export function PracticeQuizInfo({
  quiz,
  visible,
  ...other
}: Props) {
  const isMobile = useIsMobile();
  const { mylists } = useMylistInfomations();

  return (
    <Card p="sm" radius="sm" { ...other }>
      <Group position="apart">
        <Text 
          fz={ isMobile ? "lg" : "xl" }
          fw="bold"
        >{quiz.answer}</Text>
        <QuizFavoriteButton 
          quizId={quiz.id}
          isFavorite={quiz.isFavorite}
        />
      </Group>
      <Group position="apart" m={0} mt="sm">
        <QuizMylistButton
          quizId={quiz.id}
          registerdMylistId={quiz.registerdMylist}
          isMobile={isMobile}
          mylists={mylists || []}
        />
        <QuizWorkbookBadge
          workbookName={quiz.workbook}
          levelColor={quiz.level}
          date={quiz.date}
        />
      </Group>
      { !visible ? <Overlay blur={50} color="#fff" zIndex={100}/> : null }
    </Card>
  );
}