import { Group } from "@mantine/core";
import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import FilteringModalButton from "@/features/filtering/components/FilteringModalButton";
import QuizControllBar from "@/features/quiz/components/QuizControllBar";
import QuizHiddenAnswerButton from "@/features/quiz/components/QuizHiddenAnswerButton";
import QuizList from "@/features/quiz/components/QuizList";
import QuizShuffleButton from "@/features/quiz/components/QuizShuffleButton";
import QuizTransfarButton from "@/features/quiz/components/QuizTransfarButton";
import { $api } from "@/utils/client";
import { quizSearchSchema } from "./_schemas/quizSearch";

export const Route = createFileRoute("/search")({
  validateSearch: quizSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const search = useSearch({ from: "/search" });
  const [activePage, setPage] = useState(1);
  const [isHidden, setIsHidden] = useState(false);
  const { data: quizzes } = $api.useQuery("get", "/quizzes", {
    params: { query: search },
  });
  const { data: quizzesSize } = $api.useQuery("get", "/quizzes/size", {
    params: { query: search },
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
      }),
      replace: true,
    });
  };

  const toShuffle = (seed: number) => {
    setPage(1);
    router.navigate({
      to: "/search",
      search: (old) => ({
        ...old,
        page: 1,
        seed,
      }),
      replace: true,
    });
  };

  const changePage = (page: number) => {
    setPage(page);
    router.navigate({
      to: "/search",
      search: (old) => ({
        ...old,
        page,
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

  return (
    <>
      <QuizControllBar
        variant="onlyPagenation"
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
      />
      <QuizList
        quizzes={quizzes}
        page={activePage}
        perPage={search.maxView || 0}
        isHidden={isHidden}
      />
    </>
  );
}
