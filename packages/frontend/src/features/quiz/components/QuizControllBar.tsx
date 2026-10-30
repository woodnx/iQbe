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
        dates: string[];
        onChangeDates: (dates: string[]) => void;
      }
  );

export default function QuizControllBar(props: Props) {
  const {
    total,
    buttons,
    activePage,
    maxView,
    header,
    setPage,
    ...variantProps
  } = props;

  let stackProps: ComponentProps<typeof Stack>;
  let historyFilters: ReactNode;

  if (variantProps.variant === "history") {
    const {
      variant: _variant,
      judgements,
      right,
      wrong,
      throgh,
      onSelectJudgement,
      dates,
      onChangeDates,
      ...others
    } = variantProps;
    stackProps = others;
    historyFilters = (
      <>
        <Center>
          <HistorySelectJudgement
            judgements={judgements}
            right={right}
            wrong={wrong}
            throgh={throgh}
            onSelect={onSelectJudgement}
          />
        </Center>
        <Center mb="xs">
          <HistoryDateRange dates={dates} onChangeDates={onChangeDates} />
        </Center>
      </>
    );
  } else {
    const { variant: _variant, ...others } = variantProps;
    stackProps = others;
  }

  return (
    <Stack {...stackProps}>
      {header}
      <Group justify="space-between">
        <div>{buttons}</div>
        <Text ta="right">総問題数: {total}</Text>
      </Group>
      <Stack gap={1}>
        {historyFilters}
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
