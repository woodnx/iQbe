import { Card, BoxProps, Group, Overlay, Text } from "@mantine/core";
import { useMylists } from "@/hooks/useMylists";
import { useIsMobile } from "@/contexts/isMobile";
import QuizFavoriteButton from "./QuizFavoriteButton";
import { QuizWorkbookBadge } from "./QuizWorkbookBadge";
import QuizMylistButton from "./QuizMylistButton";

interface Props extends BoxProps {
  qid?: string,
  answer?: string,
  wid?: string,
  isFavorite?: boolean,
  registeredMylist?: string[],
  visible: boolean,
}

export function PracticeQuizInfo({
  qid = "",
  answer = "",
  wid = "",
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
          qid={qid}
          isFavorite={isFavorite}
          key={qid}
        />
      </Group>
      <Group justify="space-between" m={0} mt="sm">
        <QuizMylistButton
          qid={qid}
          registerdMylistId={registeredMylist}
          mylists={mylists || []}
          key={qid}
        />
        {
          (!!wid) 
          ?
          <QuizWorkbookBadge
            wid={wid}
            levelColor={'gray'}
          />
          :
          null 
        }
      </Group>
      { !visible ? <Overlay blur={50} color="#fff" zIndex={100}/> : null }
    </Card>
  );
}