import { Code, Text, Title } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { useRef, useState } from "react";
import { Element } from "@/routes/create";
import { ApiClientError, readResponse, rpc } from "@/utils/client";
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
  const [parsedCsv, setParsedCsv] = useState<Element[]>([]);
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
      setParsedCsv(data);
    } catch (error) {
      notifications.show({
        title: "CSV の読み込みに失敗しました",
        message:
          error instanceof ApiClientError
            ? error.detail
            : "ファイルの形式を確認してください",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuizzes = async (quizzes: Element[], wid: string | null) => {
    if (quizzes.some((quiz) => quiz.categoryError)) {
      throw new Error("ジャンルを修正してから保存してください。");
    }
    const _quizzes = quizzes.map((quiz) => ({
      question: quiz.question,
      answer: quiz.answer,
      anotherAnswer: quiz.anotherAnswer,
      category: quiz.category,
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
          onChange={setParsedCsv}
          onReload={() => setParsedCsv([])}
          onSave={saveQuizzes}
        />
      ) : (
        <>
          <CsvDropzone onDrop={parseCsv} loading={isLoading} />
          <Title size="h4" my="md">
            CSVファイルをインポートする手順
          </Title>
          <Text>
            1行目に見出しを指定してください。問題文は<Code>question</Code>
            ・「問題文」・「問題」、 答えは<Code>answer</Code>
            ・「答え」・「解答」・「回答」・「正解」に対応しています。
          </Text>
          <Text mt="sm">
            別解・判定基準は<Code>anotherAnswer</Code>・「別解」・「別解等」・
            「別解・正誤判定基準」・「正誤判定基準」で指定できます。複数の列がある場合は改行でまとめます。
          </Text>
          <Text mt="sm">
            「大ジャンル」「小ジャンル」には登録済みのジャンル名を入力してください。
            大ジャンルのみの指定も可能です。小ジャンルのみの場合は名前から親を特定します。
            同名の小ジャンルがある場合は大ジャンルも指定してください。
            不明なジャンルは読み込み後のプレビューで選び直せます。
          </Text>
        </>
      )}
    </>
  );
}
