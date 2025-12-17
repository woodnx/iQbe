import { Center, Group, Stack } from "@mantine/core";
import { useRouter, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import FilteringModalButton from "@/components/FilteringModalButton";
import HistoryDateRange from "@/components/HistoryDateRange";
import HistorySelectJudgement from "@/components/HistorySelectJudgement";
import QuizControllBar from "@/components/QuizControllBar";
import QuizHiddenAnswerButton from "@/components/QuizHiddenAnswerButton";
import QuizList from "@/components/QuizList";
import QuizPagination from "@/components/QuizPagination";
import QuizShuffleButton from "@/components/QuizShuffleButton";
import QuizTransfarButton from "@/components/QuizTransfarButton";
import { useHistories } from "@/hooks/useHistories";
import dayjs from "@/plugins/dayjs";
import { Judgement } from "@/types";
import { $api } from "@/utils/client";

export default function History() {
  const router = useRouter();
  const search = useSearch({ from: "/history" });
  const [activePage, setPage] = useState(1);
  const [isHidden, setIsHidden] = useState(false);
  const [judgements, setJudgements] = useState<Judgement[]>([]);
  const [dates, setDates] = useState<number[]>([
    dayjs().startOf("day").valueOf(),
    dayjs().endOf("day").valueOf(),
  ]);
  const { histories } = useHistories(dates[0], dates[1]);
  const right = !!histories ? Number(histories.right) : 0;
  const wrong = !!histories ? Number(histories.wrong) : 0;
  const through = !!histories ? Number(histories.through) : 0;

  const { data: quizzes } = $api.useQuery("get", "/quizzes", {
    params: {
      query: {
        ...search,
        judgements,
        since: dates[0],
        until: dates[1],
      },
    },
  });
  const { data: quizzesSize } = $api.useQuery("get", "/quizzes/size", {
    params: {
      query: {
        ...search,
        judgements,
        since: dates[0],
        until: dates[1],
      },
    },
  });
  const size =
    !!quizzes && !!quizzes.length && !!quizzesSize ? quizzesSize.size : 0;

  const toFilter = (
    workbooks?: string | string[],
    keyword?: string,
    keywordOption?: number,
    categories?: number | number[],
    tags?: string | string[],
    tagMatchAll?: boolean,
    perPage?: number,
  ) => {
    setPage(1);
    router.navigate({
      to: "/search",
      search: (old) => ({
        ...old,
        page: 1,
        seed: undefined,
        maxView: perPage,
        wids: workbooks,
        keyword,
        keywordOption,
        categories,
        tags,
        tagMatchAll,
        judgements,
        since: dates[0],
        until: dates[1],
      }),
      replace: true,
    });
  };

  const toShuffle = (seed: number) => {
    setPage(1);
    router.navigate({
      to: "/history",
      search: (old) => ({
        ...old,
        page: 1,
        seed,
        judgements,
        since: dates[0],
        until: dates[1],
      }),
      replace: true,
    });
  };

  const changePage = (page: number) => {
    setPage(page);
    router.navigate({
      to: "/history",
      search: (old) => ({
        ...old,
        page,
        judgements,
        since: dates[0],
        until: dates[1],
      }),
      replace: true,
    });
  };

  const toTransfar = () => {
    router.navigate({
      to: "/practice",
      search: {
        ...search,
        isTransfer: true,
      },
    });
  };

  const changeJudgement = (judgements: Judgement[]) => {
    setJudgements(judgements);
    router.navigate({
      to: "/history",
      search: (old) => ({
        ...old,
        page: 1,
        judgements,
        since: dates[0],
        until: dates[1],
      }),
      replace: true,
    });
  };

  const changeDates = (dates: number[]) => {
    setDates(dates);
    router.navigate({
      to: "/history",
      search: (old) => ({
        ...old,
        page: 1,
        judgements,
        since: dates[0],
        until: dates[1],
      }),
      replace: true,
    });
  };

  return (
    <>
      <QuizControllBar
        p="sm"
        total={size}
        buttons={
          <Group>
            <FilteringModalButton onSubmit={toFilter} />
            <QuizShuffleButton apply={toShuffle} />
            <QuizHiddenAnswerButton
              isHidden={isHidden}
              onToggle={setIsHidden}
            />
            <QuizTransfarButton
              apply={toTransfar}
              disabled={quizzes?.length === 0}
            />
          </Group>
        }
        pagination={
          <Stack gap={2}>
            <Center mt={0}>
              <HistorySelectJudgement
                judgements={judgements}
                right={right}
                wrong={wrong}
                throgh={through}
                onSelect={changeJudgement}
              />
            </Center>
            <Center mt={0}>
              <HistoryDateRange dates={dates} onChangeDates={changeDates} />
            </Center>
            <Center mt="sm">
              <QuizPagination
                page={activePage}
                total={!!search?.maxView ? Math.ceil(size / search.maxView) : 0}
                setPage={changePage}
              />
            </Center>
          </Stack>
        }
      />
      <QuizList
        quizzes={quizzes}
        page={activePage}
        perPage={activePage}
        isHidden={isHidden}
        coloring
      />
    </>
  );
}
