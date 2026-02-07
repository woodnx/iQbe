import { Button, Group, Text } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { components } from "api/schema";
import { $api } from "@/utils/client";
import {
  QUIZ_SIZES_QUERY_KEY,
  QUIZZES_QUERY_KEY,
  QuerySnapshot,
  restoreQuerySnapshot,
  takeQuerySnapshot,
  updateRelatedQuizSize,
} from "@/utils/queryCache";

type Quiz = components["schemas"]["Quiz"];

export interface QuizDeleteModalInnerProps {
  qid: string;
}

const QuizDeleteModal = ({
  id,
  context,
  innerProps,
}: ContextModalProps<QuizDeleteModalInnerProps>) => {
  const { qid } = innerProps;
  const queryClient = useQueryClient();
  const { mutate } = $api.useMutation("delete", "/quizzes/{qid}", {
    onMutate: async ({ params }) => {
      await queryClient.cancelQueries({ queryKey: QUIZZES_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: QUIZ_SIZES_QUERY_KEY });

      const previousQuizzes = takeQuerySnapshot<Quiz[]>(
        queryClient,
        QUIZZES_QUERY_KEY,
      );

      previousQuizzes.forEach(([key, data]) => {
        const nextData = data?.filter((quiz) => quiz.qid !== params.path.qid);
        queryClient.setQueryData<Quiz[] | undefined>(key, nextData);

        if (data && nextData && data.length !== nextData.length) {
          updateRelatedQuizSize(
            queryClient,
            key,
            nextData.length - data.length,
          );
        }
      });

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
      queryClient.invalidateQueries({ queryKey: QUIZ_SIZES_QUERY_KEY });
    },
  });
  const icon = <IconTrash />;

  const submit = () => {
    mutate(
      {
        params: {
          path: {
            qid,
          },
        },
      },
      {
        onSettled() {
          context.closeModal(id);
        },
        onSuccess: () => {
          notifications.show({
            title: "クイズを削除しました",
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
  };

  return (
    <>
      <Text>クイズを削除しますか？</Text>
      <Text c="red" size="sm">
        ※この変更は元に戻せません。
      </Text>
      <Group justify="space-between" mt="sm">
        <Button variant="outline" color="gray" onClick={close}>
          キャンセル
        </Button>
        <Button color="red" onClick={submit} leftSection={icon}>
          削除
        </Button>
      </Group>
    </>
  );
};

export default QuizDeleteModal;
