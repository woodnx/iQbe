import { Card, DefaultProps, Group, Overlay, Text } from "@mantine/core";
import QuizFavoriteButton from "./QuizFavoriteButton";
import { QuizWorkbookBadge } from "./QuizWorkbookBadge";
import QuizMylistButton from "./QuizMylistButton";
import { useIsMobile } from "../hooks";
import { useMylistInfomations } from "../hooks/useMylists";

interface Props extends DefaultProps {
  quizId?: number,
  answer?: string,
  workbook?: string,
  level?: string,
  date?: string,
  isFavorite?: boolean,
  registeredMylist?: number[],
  visible: boolean,
}

export function PracticeQuizInfo({
  quizId = 0,
  answer = "",
  workbook = "",
  level = "",
  date = "",
  isFavorite = false,
  registeredMylist = [],
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
        >{answer}</Text>
        <QuizFavoriteButton 
          quizId={quizId}
          isFavorite={isFavorite}
          key={quizId}
        />
      </Group>
      <Group position="apart" m={0} mt="sm">
        <QuizMylistButton
          quizId={quizId}
          registerdMylistId={registeredMylist}
          isMobile={isMobile}
          mylists={mylists || []}
          key={quizId}
        />
        <QuizWorkbookBadge
          workbookName={workbook}
          levelColor={level}
          date={date}
        />
      </Group>
      { !visible ? <Overlay blur={50} color="#fff" zIndex={100}/> : null }
    </Card>
  );
}