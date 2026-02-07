import { ActionIcon } from "@mantine/core";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { components } from "api/schema";
import { useState } from "react";
import { $api } from "@/utils/client";
import {
  QUIZ_SIZES_QUERY_KEY,
  QUIZZES_QUERY_KEY,
  QuerySnapshot,
  restoreQuerySnapshot,
  takeQuerySnapshot,
  updateRelatedQuizSize,
} from "@/utils/queryCache";

interface QuizFavoriteButtonProps {
  isFavorite: boolean;
  qid: string;
}

type Quiz = components["schemas"]["Quiz"];

export default function QuizFavoriteButton({
  isFavorite: innerIsFavorite,
  qid,
}: QuizFavoriteButtonProps) {
  const [isFavorite, setFavorite] = useState(innerIsFavorite);
  const queryClient = useQueryClient();
  const { mutate: like } = $api.useMutation("post", "/like", {
    onMutate: async ({ body }) => {
      await queryClient.cancelQueries({ queryKey: QUIZZES_QUERY_KEY });
      const previousQuizzes = takeQuerySnapshot<Quiz[]>(
        queryClient,
        QUIZZES_QUERY_KEY,
      );
      const previousFavorite = isFavorite;

      setFavorite(true);
      queryClient.setQueriesData<Quiz[] | undefined>(
        { queryKey: QUIZZES_QUERY_KEY },
        (data) =>
          data?.map((quiz) =>
            quiz.qid === body.qid ? { ...quiz, isFavorite: true } : quiz,
          ),
      );

      return { previousQuizzes, previousFavorite };
    },
    onError: (_, __, context) => {
      const rollback = context as
        | {
            previousQuizzes: QuerySnapshot<Quiz[]>;
            previousFavorite: boolean;
          }
        | undefined;
      if (!rollback) return;
      restoreQuerySnapshot(queryClient, rollback.previousQuizzes);
      setFavorite(rollback.previousFavorite);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUIZZES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: QUIZ_SIZES_QUERY_KEY });
    },
  });
  const { mutate: unlike } = $api.useMutation("post", "/unlike", {
    onMutate: async ({ body }) => {
      await queryClient.cancelQueries({ queryKey: QUIZZES_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: QUIZ_SIZES_QUERY_KEY });
      const previousQuizzes = takeQuerySnapshot<Quiz[]>(
        queryClient,
        QUIZZES_QUERY_KEY,
      );
      const previousFavorite = isFavorite;

      setFavorite(false);
      previousQuizzes.forEach(([key, data]) => {
        const query = (
          key[2] as { params?: { query?: { isFavorite?: boolean } } }
        )?.params?.query;
        const nextData = query?.isFavorite
          ? data?.filter((quiz) => quiz.qid !== body.qid)
          : data?.map((quiz) =>
              quiz.qid === body.qid ? { ...quiz, isFavorite: false } : quiz,
            );

        queryClient.setQueryData<Quiz[] | undefined>(key, nextData);

        if (data && nextData && data.length !== nextData.length) {
          updateRelatedQuizSize(
            queryClient,
            key,
            nextData.length - data.length,
          );
        }
      });

      return { previousQuizzes, previousFavorite };
    },
    onError: (_, __, context) => {
      const rollback = context as
        | {
            previousQuizzes: QuerySnapshot<Quiz[]>;
            previousFavorite: boolean;
          }
        | undefined;
      if (!rollback) return;
      restoreQuerySnapshot(queryClient, rollback.previousQuizzes);
      setFavorite(rollback.previousFavorite);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUIZZES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: QUIZ_SIZES_QUERY_KEY });
    },
  });

  const addFavoriteList = async () => {
    if (isFavorite) {
      unlike({
        body: {
          qid,
        },
      });
    } else {
      like({
        body: {
          qid,
        },
      });
    }
  };

  return (
    <ActionIcon
      color={isFavorite ? "yellow.5" : "gray"}
      onClick={addFavoriteList}
      variant="subtle"
    >
      {isFavorite ? <IconStarFilled /> : <IconStar />}
    </ActionIcon>
  );
}
