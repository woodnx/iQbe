import { Group } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import FilteringModalButton from "@/features/filtering/components/FilteringModalButton";
import QuizControllBar from "@/features/quiz/components/QuizControllBar";
import QuizHiddenAnswerButton from "@/features/quiz/components/QuizHiddenAnswerButton";
import QuizList from "@/features/quiz/components/QuizList";
import QuizShuffleButton from "@/features/quiz/components/QuizShuffleButton";
import QuizTransfarButton from "@/features/quiz/components/QuizTransfarButton";
import { useHistories } from "@/hooks/useHistories";
import dayjs from "@/plugins/dayjs";
import { Judgement } from "@/types";
import { api } from "@/utils/api";
import { quizSearchSchema } from "./_schemas/quizSearch";

export const Route = createFileRoute("/history")({
  validateSearch: quizSearchSchema.transform((value) => {
    const since =
      value.since != null ? value.since : dayjs().startOf("day").toISOString();
    const until =
      value.until != null ? value.until : dayjs().endOf("day").toISOString();
    return {
      ...value,
      since,
      until,
    };
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const search = useSearch({ from: "/history" });
  const [activePage, setPage] = useState(search.page ?? 1);
  const [isHidden, setIsHidden] = useState(false);
  const [judgements, setJudgements] = useState<Judgement[]>(
    search.judgements || [],
  );
  const [dates, setDates] = useState<string[]>([
    dayjs(search.since || undefined)
      .startOf("day")
      .toISOString(),
    dayjs(search.until || undefined)
      .endOf("day")
      .toISOString(),
  ]);
  const { histories } = useHistories(dates[0], dates[1]);
  const right = !!histories ? Number(histories.right) : 0;
  const wrong = !!histories ? Number(histories.wrong) : 0;
  const throgh = !!histories ? Number(histories.through) : 0;

  const { data: quizzes } = useQuery({
    queryKey: [
      "get",
      "/quizzes",
      {
        params: {
          query: {
            ...search,
            judgements,
            since: dates[0],
            until: dates[1],
          },
        },
      },
    ],
    queryFn: ({ signal }) =>
      api.getQuizzes(
        {
          params: {
            query: {
              ...search,
              judgements,
              since: dates[0],
              until: dates[1],
            },
          },
        },
        signal,
      ),
  });
  const { data: quizzesSize } = useQuery({
    queryKey: [
      "get",
      "/quizzes/size",
      {
        params: {
          query: {
            ...search,
            judgements,
            since: dates[0],
            until: dates[1],
          },
        },
      },
    ],
    queryFn: ({ signal }) =>
      api.getQuizzesSize(
        {
          params: {
            query: {
              ...search,
              judgements,
              since: dates[0],
              until: dates[1],
            },
          },
        },
        signal,
      ),
  });
  const size = quizzesSize?.size ?? 0;

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
      to: "/history",
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
    setPage(1);
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

  const changeDates = (dates: string[]) => {
    setPage(1);
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
        variant="history"
        pb="sm"
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
        activePage={activePage}
        maxView={search.maxView || 100}
        setPage={changePage}
        judgements={judgements}
        right={right}
        wrong={wrong}
        throgh={throgh}
        onSelectJudgement={changeJudgement}
        dates={dates}
        onChangeDates={changeDates}
      />
      <QuizList
        quizzes={quizzes}
        page={activePage}
        perPage={search.maxView ?? 100}
        isHidden={isHidden}
        coloring
      />
    </>
  );
}
