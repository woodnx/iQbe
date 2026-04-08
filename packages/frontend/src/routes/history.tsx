import { Group } from "@mantine/core";
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
import { $api } from "@/utils/client";
import { convertJudgements } from "@/utils/convertJudgement";
import { quizSearchSchema } from "./_schemas/quizSearch";

export const Route = createFileRoute("/history")({
  validateSearch: quizSearchSchema.transform((value) => {
    const since =
      typeof value.since === "number" && !Number.isNaN(value.since)
        ? value.since
        : dayjs().startOf("day").valueOf();
    const until =
      typeof value.until === "number" && !Number.isNaN(value.until)
        ? value.until
        : dayjs().endOf("day").valueOf();
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
  const [activePage, setPage] = useState(1);
  const [isHidden, setIsHidden] = useState(false);
  const [judgements, setJudgements] = useState<Judgement[]>(
    convertJudgements(search.judgements || []),
  );
  const [dates, setDates] = useState<number[]>([
    dayjs(search.since || undefined)
      .startOf("day")
      .valueOf(),
    dayjs(search.until || undefined)
      .endOf("day")
      .valueOf(),
  ]);
  const { histories } = useHistories(dates[0], dates[1]);
  const right = !!histories ? Number(histories.right) : 0;
  const wrong = !!histories ? Number(histories.wrong) : 0;
  const throgh = !!histories ? Number(histories.through) : 0;

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
        perPage={activePage}
        isHidden={isHidden}
        coloring
      />
    </>
  );
}
