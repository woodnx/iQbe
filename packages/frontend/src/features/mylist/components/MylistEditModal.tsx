import { BoxProps } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useQueryClient } from "@tanstack/react-query";
import { components } from "api/schema";
import { $api } from "@/utils/client";
import {
  MYLISTS_QUERY_KEY,
  QUIZZES_QUERY_KEY,
  QuerySnapshot,
  restoreQuerySnapshot,
  takeQuerySnapshot,
} from "@/utils/queryCache";

import MylistEditForm from "./MylistEditForm";

interface MylistEditModalInnerProps extends BoxProps {
  mid: string;
  name: string;
}

type Mylist = components["schemas"]["Mylist"];
type Quiz = components["schemas"]["Quiz"];

export default function MylistEditModal({
  context,
  id,
  innerProps,
}: ContextModalProps<MylistEditModalInnerProps>) {
  const { mid, name } = innerProps;
  const queryClient = useQueryClient();
  const { mutate } = $api.useMutation("put", "/mylists", {
    onMutate: async ({ body }) => {
      await queryClient.cancelQueries({ queryKey: MYLISTS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: QUIZZES_QUERY_KEY });

      const previousMylists = takeQuerySnapshot<Mylist[]>(
        queryClient,
        MYLISTS_QUERY_KEY,
      );
      const previousQuizzes = takeQuerySnapshot<Quiz[]>(
        queryClient,
        QUIZZES_QUERY_KEY,
      );

      queryClient.setQueriesData<Mylist[] | undefined>(
        { queryKey: MYLISTS_QUERY_KEY },
        (data) =>
          data?.map((mylist) =>
            mylist.mid === body.mid
              ? { ...mylist, name: body.listName }
              : mylist,
          ),
      );
      queryClient.setQueriesData<Quiz[] | undefined>(
        { queryKey: QUIZZES_QUERY_KEY },
        (data) =>
          data?.map((quiz) => ({
            ...quiz,
            registerdMylist: quiz.registerdMylist?.map((mylist) =>
              mylist.mid === body.mid
                ? {
                    ...mylist,
                    name: body.listName,
                  }
                : mylist,
            ),
          })),
      );

      return { previousMylists, previousQuizzes };
    },
    onError: (_, __, context) => {
      const rollback = context as
        | {
            previousMylists: QuerySnapshot<Mylist[]>;
            previousQuizzes: QuerySnapshot<Quiz[]>;
          }
        | undefined;
      if (!rollback) return;
      restoreQuerySnapshot(queryClient, rollback.previousMylists);
      restoreQuerySnapshot(queryClient, rollback.previousQuizzes);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MYLISTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: QUIZZES_QUERY_KEY });
    },
  });

  const toEdit = async (listName: string) => {
    mutate({
      body: {
        mid,
        listName,
      },
    });
    context.closeModal(id);
  };

  return (
    <MylistEditForm
      name={name}
      onSave={toEdit}
      onClose={() => context.closeModal(id)}
    />
  );
}
