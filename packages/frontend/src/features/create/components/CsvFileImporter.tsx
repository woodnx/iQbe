import { FileWithPath } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { $api, client } from "@/utils/client";
import {
  QUIZ_SIZES_QUERY_KEY,
  QUIZZES_QUERY_KEY,
  QuerySnapshot,
  restoreQuerySnapshot,
  takeQuerySnapshot,
} from "@/utils/queryCache";
import { Element } from "./CreateDashboard";
import CsvDropzone from "./CsvDropzone";
import CsvEditor from "./CsvEditor";

export default function CsvFileImporter() {
  const [parsedCsv, setPasedCsv] = useState<Element[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const previousQuizSizesRef = useRef<QuerySnapshot<{ size: number }>>([]);
  const { mutateAsync: addQuizzes } = $api.useMutation(
    "post",
    "/quizzes/multiple",
    {
      onMutate: async ({ body }) => {
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
          queryClient.setQueryData<{ size: number } | undefined>(
            key,
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
    },
  );

  const parseCsv = async (files: FileWithPath[]) => {
    setIsLoading(true);
    const file = files[0];

    const formData = new FormData();
    formData.append("file", file);

    const { data } = await client.POST("/csv/parse", {
      // @ts-ignore
      body: formData,
    });

    setPasedCsv(data || []);
    setIsLoading(false);
  };

  const saveQuizzes = async (quizzes: Element[], wid: string | null) => {
    const _quizzes = quizzes.map((quiz) => ({
      question: quiz.question,
      answer: quiz.answer,
      anotherAnswer: quiz.anotherAnswer,
      wid,
    }));

    await addQuizzes({
      body: {
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
        <CsvDropzone onDrop={parseCsv} loading={isLoading} />
      )}
    </>
  );
}
