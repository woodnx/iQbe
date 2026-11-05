import { useIsMobile } from "@/contexts/isMobile";
import QuizFavoriteButton from "@/features/quiz/components/QuizFavoriteButton";
import QuizMylistButton from "@/features/quiz/components/QuizMylistButton";
import { QuizWorkbookBadge } from "@/features/quiz/components/QuizWorkbookBadge";
import type {
  Mylist as ApiMylist,
  Workbook as ApiWorkbook,
} from "@/utils/api-types";
import { BoxProps, Card, Group, Overlay, Stack, Text } from "@mantine/core";

type Mylist = ApiMylist;
type Workbook = ApiWorkbook;

interface Props extends BoxProps {
  qid: string;
  answer: string;
  anotherAnswer?: string;
  workbook?: Workbook;
  isFavorite?: boolean;
  registeredMylist?: Mylist[];
  visible: boolean;
}

export function PracticeQuizInfo({
  qid,
  answer,
  anotherAnswer,
  workbook,
  isFavorite = false,
  registeredMylist = [],
  visible,
  ...other
}: Props) {
  const isMobile = useIsMobile();

  return (
    <Card {...other} px={8} py="md">
      <Group justify="space-between">
        <Stack gap={1}>
          <Text fz={isMobile ? "lg" : "xl"} fw="bold">
            {answer}
          </Text>
          {anotherAnswer && (
            <Text fz={isMobile ? "xs" : "sm"} c="gray">
              {anotherAnswer}
            </Text>
          )}
        </Stack>

        <QuizFavoriteButton qid={qid} isFavorite={isFavorite} key={qid} />
      </Group>
      <Group justify="space-between" m={0} mt="sm">
        <QuizMylistButton
          qid={qid}
          registerdMylists={registeredMylist}
          key={qid}
        />
        {workbook ? <QuizWorkbookBadge workbook={workbook} /> : null}
      </Group>
      {!visible ? (
        <Overlay backgroundOpacity={1} color="#fff" zIndex={100} />
      ) : null}
    </Card>
  );
}
