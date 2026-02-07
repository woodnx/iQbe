import { ContextModalProps } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { components, paths } from "api/schema";
import { $api } from "@/utils/client";
import {
  QUIZZES_QUERY_KEY,
  QuerySnapshot,
  restoreQuerySnapshot,
  takeQuerySnapshot,
} from "@/utils/queryCache";

import QuizEditForm from "./QuizEditForm";

type QuizEditSubmitValues =
  paths["/quizzes"]["post"]["requestBody"]["content"]["application/json"];
type Category = components["schemas"]["Category"];
type Quiz = components["schemas"]["Quiz"];

interface Props {
  qid: string;
  question: string;
  answer: string;
  wid?: string;
  category?: Category[];
  tags?: string[];
}

export default function ({
  context,
  id,
  innerProps,
}: ContextModalProps<Props>) {
  const { qid, ...formProps } = innerProps;
  const queryClient = useQueryClient();
  const { mutate } = $api.useMutation("put", "/quizzes/{qid}", {
    onMutate: async ({ body, params }) => {
      await queryClient.cancelQueries({ queryKey: QUIZZES_QUERY_KEY });
      const previousQuizzes = takeQuerySnapshot<
        components["schemas"]["Quiz"][]
      >(queryClient, QUIZZES_QUERY_KEY);

      queryClient.setQueriesData<components["schemas"]["Quiz"][] | undefined>(
        { queryKey: QUIZZES_QUERY_KEY },
        (data) =>
          data?.map((quiz) =>
            quiz.qid === params.path.qid
              ? {
                  ...quiz,
                  question: body.question,
                  answer: body.answer,
                  anotherAnswer: body.anotherAnswer,
                  wid: body.wid,
                  tagLabels: body.tags,
                }
              : quiz,
          ),
      );

      return { previousQuizzes };
    },
    onError: (_, __, context) => {
      const rollback = context as
        | {
            previousQuizzes: QuerySnapshot<Quiz[]>;
          }
        | undefined;
      if (!rollback) return;
      restoreQuerySnapshot(queryClient, rollback.previousQuizzes);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUIZZES_QUERY_KEY });
    },
  });
  const submit = async ({
    question,
    answer,
    tags,
    category,
    wid,
  }: QuizEditSubmitValues) => {
    mutate(
      {
        body: {
          question,
          answer,
          category,
          tags,
          wid,
        },
        params: { path: { qid } },
      },
      {
        onSuccess: () => {
          notifications.show({
            title: "クイズを編集しました",
            message: "",
          });
        },
        onError: () => {
          notifications.show({
            title: "何らかの障害が発生しました",
            message: "何度も続く場合はサポート担当に問い合わせてください",
            color: "red",
          });
        },
      },
    );
    context.closeModal(id);
  };

  return (
    <>
      <QuizEditForm {...formProps} onSubmit={(v) => submit(v)} />
    </>
  );
}
