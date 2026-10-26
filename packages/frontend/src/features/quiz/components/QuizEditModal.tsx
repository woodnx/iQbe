import type {
  Category as ApiCategory,
  Quiz as ApiQuiz,
  QuizInput as ApiQuizInput,
} from "@/utils/api-types";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { ContextModalProps } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import {
  QUIZZES_QUERY_KEY,
  QuerySnapshot,
  restoreQuerySnapshot,
  takeQuerySnapshot,
} from "@/utils/queryCache";

import QuizEditForm from "./QuizEditForm";

type QuizEditSubmitValues = ApiQuizInput;
type Category = ApiCategory;
type Quiz = ApiQuiz;

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
  const { mutate } = useMutation({
    mutationKey: ["put", "/quizzes/{qid}"],
    mutationFn: api.putQuizzesQid,
    onMutate: async ({ body, params }) => {
      await queryClient.cancelQueries({ queryKey: QUIZZES_QUERY_KEY });
      const previousQuizzes = takeQuerySnapshot<ApiQuiz[]>(
        queryClient,
        QUIZZES_QUERY_KEY,
      );

      queryClient.setQueriesData<ApiQuiz[] | undefined>(
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
