import { Card, BoxProps, Group, Overlay, Text } from "@mantine/core";
import { useIsMobile } from "@/contexts/isMobile";
import QuizFavoriteButton from "./QuizFavoriteButton";
import { QuizWorkbookBadge } from "./QuizWorkbookBadge";
import QuizMylistButton from "./QuizMylistButton";
import { components } from "api/schema";

type Mylist = components["schemas"]["Mylist"];
type Workbook = components["schemas"]["Workbook"];

interface Props extends BoxProps {
  qid?: string,
  answer?: string,
  workbook?: Workbook,
  isFavorite?: boolean,
  registeredMylist?: Mylist[],
  visible: boolean,
}

export function PracticeQuizInfo({
  qid = "",
  answer = "",
  workbook,
  isFavorite = false,
  registeredMylist = [],
  visible,
  ...other
}: Props) {
  const isMobile = useIsMobile();

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
          registerdMylists={registeredMylist}
          key={qid}
        />
        {
          (!!workbook) 
          ?
          <QuizWorkbookBadge
            workbook={workbook}
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