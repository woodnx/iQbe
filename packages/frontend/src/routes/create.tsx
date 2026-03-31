import { Tabs } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { paths } from "api/schema";
import { useRef } from "react";
import CsvFileImporter from "@/features/create/components/CsvFileImporter";
import QuizEditForm from "@/features/quiz/components/QuizEditForm";
import { $api } from "@/utils/client";
import {
  QUIZ_SIZES_QUERY_KEY,
  QUIZZES_QUERY_KEY,
  QuerySnapshot,
  restoreQuerySnapshot,
  takeQuerySnapshot,
} from "@/utils/queryCache";

type QuizEditSubmitValues =
  paths["/quizzes"]["post"]["requestBody"]["content"]["application/json"];

export interface Element {
  question: string;
  answer: string;
  anotherAnswer?: string | null;
}

export const Route = createFileRoute("/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const previousQuizSizesRef = useRef<QuerySnapshot<{ size: number }>>([]);
  const { mutate } = $api.useMutation("post", "/quizzes", {
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: QUIZ_SIZES_QUERY_KEY });

      const previousQuizSizes = takeQuerySnapshot<{ size: number }>(
        queryClient,
        QUIZ_SIZES_QUERY_KEY,
      );
      previousQuizSizesRef.current = previousQuizSizes;

      previousQuizSizes.forEach(([key, data]) => {
        queryClient.setQueryData<{ size: number } | undefined>(
          key,
          data ? { ...data, size: data.size + 1 } : data,
        );
      });
    },
    onSuccess: () => {
      notifications.show({
        title: "新しいクイズを作成しました",
        message: "",
      });
    },
    onError: () => {
      restoreQuerySnapshot(queryClient, previousQuizSizesRef.current);
      notifications.show({
        title: "何らかの障害が発生しました",
        message: "何度も続く場合はサポート担当に問い合わせてください",
        color: "red",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUIZZES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: QUIZ_SIZES_QUERY_KEY });
    },
  });

  const submit = ({
    question,
    answer,
    category,
    tags,
    wid,
  }: QuizEditSubmitValues) => {
    mutate({
      body: {
        question,
        answer,
        category,
        tags,
        wid,
      },
    });
  };

  return (
    <>
      <Tabs defaultValue="single">
        <Tabs.List grow>
          <Tabs.Tab value="single">シングル</Tabs.Tab>
          <Tabs.Tab value="file">CSVファイル</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="single" pt="xs">
          <QuizEditForm
            question=""
            answer=""
            mb={16}
            p="md"
            radius="lg"
            onSubmit={submit}
          />
        </Tabs.Panel>
        <Tabs.Panel value="file" pt="xs">
          <CsvFileImporter />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
