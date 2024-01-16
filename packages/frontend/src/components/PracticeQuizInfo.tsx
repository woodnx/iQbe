import { Card, BoxProps, Group, Overlay, Text } from "@mantine/core";
import { useMylists } from "@/hooks/useMylists";
import { useIsMobile } from "@/contexts/isMobile";
import QuizFavoriteButton from "./QuizFavoriteButton";
import { QuizWorkbookBadge } from "./QuizWorkbookBadge";
import QuizMylistButton from "./QuizMylistButton";

interface Props extends BoxProps {
  quizId?: number,
  answer?: string,
  workbook?: string,
  level?: string,
  date?: string,
  isFavorite?: boolean,
  registeredMylist?: string[],
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
  const { mylists } = useMylists();

  return (
    <Card p="sm" radius="sm" { ...other }>
      <Group justify="space-between">
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
      <Group justify="space-between" m={0} mt="sm">
        <QuizMylistButton
          quizId={quizId}
          registerdMylistId={registeredMylist}
          mylists={mylists || []}
          key={quizId}
        />
        {
          (!!workbook && !!level && !!date) 
          ?
          <QuizWorkbookBadge
            workbookName={workbook}
            levelColor={level}
            date={date}
          />
          :
          null 
        }
      </Group>
      { !visible ? <Overlay blur={50} color="#fff" zIndex={100}/> : null }
    </Card>
  );
}