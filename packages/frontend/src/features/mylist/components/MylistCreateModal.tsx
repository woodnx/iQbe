import { BoxProps } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { components } from "api/schema";
import { useRef } from "react";
import { $api } from "@/utils/client";
import {
  MYLISTS_QUERY_KEY,
  QUIZZES_QUERY_KEY,
  QuerySnapshot,
  restoreQuerySnapshot,
  takeQuerySnapshot,
} from "@/utils/queryCache";
import MylistEditForm from "./MylistEditForm";

interface MylistCreateModalInnerProps extends BoxProps {
  qid: string;
}

type Mylist = components["schemas"]["Mylist"];
type Quiz = components["schemas"]["Quiz"];

export default function MylistCreateModal({
  context,
  id,
  innerProps,
}: ContextModalProps<MylistCreateModalInnerProps>) {
  const { qid } = innerProps;
  const queryClient = useQueryClient();
  const previousMylistsRef = useRef<QuerySnapshot<Mylist[]>>([]);
  const previousQuizzesRef = useRef<QuerySnapshot<Quiz[]>>([]);
  const tempMidRef = useRef<string | null>(null);
  const { mutate: addMylist } = $api.useMutation("post", "/mylists", {
    onMutate: async ({ body }) => {
      await queryClient.cancelQueries({ queryKey: MYLISTS_QUERY_KEY });
      const previousMylists = takeQuerySnapshot<Mylist[]>(
        queryClient,
        MYLISTS_QUERY_KEY,
      );
      previousMylistsRef.current = previousMylists;

      const tempMid = `tmp-${Date.now()}`;
      tempMidRef.current = tempMid;
      const optimisticMylist: Mylist = {
        mid: tempMid,
        name: body.listName,
        created: new Date(),
      };

      queryClient.setQueriesData<Mylist[] | undefined>(
        { queryKey: MYLISTS_QUERY_KEY },
        (data) => (data ? [...data, optimisticMylist] : data),
      );
    },
    onSuccess: (createdMylist) => {
      const tempMid = tempMidRef.current;
      if (!tempMid) return;

      queryClient.setQueriesData<Mylist[] | undefined>(
        { queryKey: MYLISTS_QUERY_KEY },
        (data) =>
          data?.map((mylist) =>
            mylist.mid === tempMid ? createdMylist : mylist,
          ),
      );
    },
    onError: () => {
      restoreQuerySnapshot(queryClient, previousMylistsRef.current);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MYLISTS_QUERY_KEY });
    },
  });
  const { mutate: addQuizToMylist } = $api.useMutation("post", "/register", {
    onMutate: async ({ body }) => {
      await queryClient.cancelQueries({ queryKey: QUIZZES_QUERY_KEY });
      const previousQuizzes = takeQuerySnapshot<Quiz[]>(
        queryClient,
        QUIZZES_QUERY_KEY,
      );
      previousQuizzesRef.current = previousQuizzes;

      const mylist = queryClient
        .getQueryData<Mylist[]>(["get", "/mylists", undefined])
        ?.find((list) => list.mid === body.mid);

      const optimisticMylist: Mylist = mylist || {
        mid: body.mid,
        name: "",
        created: new Date(),
      };

      queryClient.setQueriesData<Quiz[] | undefined>(
        { queryKey: QUIZZES_QUERY_KEY },
        (data) =>
          data?.map((quiz) =>
            quiz.qid === body.qid
              ? {
                  ...quiz,
                  registerdMylist: [
                    ...(quiz.registerdMylist || []).filter(
                      (list) => list.mid !== body.mid,
                    ),
                    optimisticMylist,
                  ],
                }
              : quiz,
          ),
      );

      return { previousQuizzes };
    },
    onError: () => {
      restoreQuerySnapshot(queryClient, previousQuizzesRef.current);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUIZZES_QUERY_KEY });
    },
  });

  const toCreate = async (mylistname: string) => {
    addMylist(
      {
        body: {
          listName: mylistname,
        },
      },
      {
        onSuccess: (createdMylist) => {
          addQuizToMylist({
            body: {
              qid,
              mid: createdMylist.mid,
            },
          });
          notifications.show({
            title: "マイリストを新規作成しました",
            message: "マイリストを作成し、クイズを追加しました",
          });
        },
      },
    );
    context.closeModal(id);
  };
  return (
    <MylistEditForm onSave={toCreate} onClose={() => context.closeModal(id)} />
  );
}
