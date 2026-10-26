import { Code, Text, Title } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { useRef, useState } from "react";
import { Element } from "@/routes/create";
import { readResponse, rpc } from "@/utils/client";
import {
  QUIZ_SIZES_QUERY_KEY,
  QUIZZES_QUERY_KEY,
  QuerySnapshot,
  restoreQuerySnapshot,
  takeQuerySnapshot,
} from "@/utils/queryCache";
import CsvDropzone from "./CsvDropzone";
import CsvEditor from "./CsvEditor";

export default function CsvFileImporter() {
  const [parsedCsv, setPasedCsv] = useState<Element[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const previousQuizSizesRef = useRef<QuerySnapshot<{ size: number }>>([]);
  const { mutateAsync: addQuizzes } = useMutation({
    mutationKey: ["post", "/quizzes/multiple"],
    mutationFn: (
      input: InferRequestType<typeof rpc.api.quizzes.multiple.$post>,
    ) => rpc.api.quizzes.multiple.$post(input).then(readResponse),
    onMutate: async ({ json: body }) => {
      const addCount = body.records?.length || 0;

      if (addCount <= 0) {
        return;
      }

      await queryClient.cancelQueries({ queryKey: QUIZ_SIZES_QUERY_KEY });

      const previousQuizSizes = takeQuerySnapshot<{ size: number }>(
        queryClient,
        QUIZ_SIZES_QUERY_KEY,
      );
      previousQuizSizesRef.current = previousQuizSizes;

      previousQuizSizes.forEach(([key, data]) => {
        queryClient.setQueryData<{ size: number } | undefined>(key, () =>
          data ? { ...data, size: data.size + addCount } : data,
        );
      });
    },
    onError: () => {
      restoreQuerySnapshot(queryClient, previousQuizSizesRef.current);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUIZZES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: QUIZ_SIZES_QUERY_KEY });
    },
  });

  const parseCsv = async (files: FileWithPath[]) => {
    setIsLoading(true);
    const file = files[0];

    try {
      const data = await rpc.api.csv.parse
        .$post({ form: { file } })
        .then(readResponse);
      setPasedCsv(data);
    } catch {
      notifications.show({
        title: "CSV の読み込みに失敗しました",
        message: "ファイルの形式を確認してください",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuizzes = async (quizzes: Element[], wid: string | null) => {
    const _quizzes = quizzes.map((quiz) => ({
      question: quiz.question,
      answer: quiz.answer,
      anotherAnswer: quiz.anotherAnswer,
      wid,
    }));

    await addQuizzes({
      json: {
        records: _quizzes,
      },
    });

    notifications.show({
      title: `クイズのインポートが完了しました`,
      message: `クイズを${_quizzes.length}問インポートしました`,
      position: "top-right",
    });
  };

  return (
    <>
      {parsedCsv.length > 0 ? (
        <CsvEditor
          elements={parsedCsv}
          onReload={() => setPasedCsv([])}
          onSave={saveQuizzes}
        />
      ) : (
        <>
          <CsvDropzone onDrop={parseCsv} loading={isLoading} />
          <Title size="h4" my="md">
            CSVファイルをインポートする手順
          </Title>
          <Text>
            CSVファイルの一番上の行（カラム欄）の問題文の箇所を
            <Code>question</Code>、答えの箇所を<Code>answer</Code>としてください
          </Text>
        </>
      )}
    </>
  );
}
