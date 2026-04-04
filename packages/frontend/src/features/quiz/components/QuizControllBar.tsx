import { Center, Group, Stack, Text } from "@mantine/core";
import { ComponentProps, ReactNode } from "react";
import HistoryDateRange from "@/features/history/components/HistoryDateRange";
import HistorySelectJudgement from "@/features/history/components/HistorySelectJudgement";
import { Judgement } from "@/types";
import QuizPagination from "./QuizPagination";

type Props = ComponentProps<typeof Stack> &
  (
    | {
        variant: "onlyPagenation";
        total: number;
        buttons: ReactNode;
        activePage: number;
        maxView: number;
        header?: ReactNode;
        setPage: (value: number) => void;
      }
    | {
        variant: "history";
        total: number;
        buttons: ReactNode;
        activePage: number;
        maxView: number;
        header?: ReactNode;
        setPage: (value: number) => void;
        judgements: Judgement[];
        right: number;
        wrong: number;
        throgh: number;
        onSelectJudgement: (judgements: Judgement[]) => void;
        dates: number[];
        onChangeDates: (dates: number[]) => void;
      }
  );

export default function QuizControllBar(props: Props) {
  const {
    variant,
    total,
    buttons,
    activePage,
    maxView,
    header,
    setPage,
    ...others
  } = props;

  return (
    <Stack {...others}>
      {header}
      <Group justify="space-between">
        <div>{buttons}</div>
        <Text ta="right">総問題数: {total}</Text>
      </Group>
      <Stack gap={1}>
        {variant == "history" && (
          <>
            <Center>
              <HistorySelectJudgement
                judgements={props.judgements}
                right={props.right}
                wrong={props.wrong}
                throgh={props.throgh}
                onSelect={props.onSelectJudgement}
              />
            </Center>
            <Center mb="xs">
              <HistoryDateRange
                dates={props.dates}
                onChangeDates={props.onChangeDates}
              />
            </Center>
          </>
        )}
        <Center>
          <QuizPagination
            page={activePage}
            total={Math.ceil(total / maxView)}
            setPage={setPage}
          />
        </Center>
      </Stack>
    </Stack>
  );
}
