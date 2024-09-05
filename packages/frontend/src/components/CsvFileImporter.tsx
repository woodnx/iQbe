import { FileWithPath } from "@mantine/dropzone";
import { Element } from "./CreateDashboard";
import CsvDropzone from "./CsvDropzone";
import { $api, client } from "@/utils/client";
import { useState } from "react";
import CsvEditor from "./CsvEditor";

export default function CsvFileImporter() {
  const [ parsedCsv, setPasedCsv ] = useState<Element[]>([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const { mutateAsync: addQuiz } = $api.useMutation('post', '/quizzes');

  const parseCsv = async (files: FileWithPath[]) => {
    setIsLoading(true);
    const file = files[0];

    const formData = new FormData();
    formData.append('file', file);

    const { data } = await client.POST("/csv/parse", {
      // @ts-ignore
      body: formData,
    });

    setPasedCsv(data || []);
    setIsLoading(false);
  }

  const saveQuizzes = async (quizzes: Element[], wid: string | null) => {
    setIsLoading(true);

    for (const quiz of quizzes) {
      await addQuiz({
        body: {
          question: quiz.question,
          answer: quiz.answer,
          anotherAnswer: quiz.anotherAnswer,
          wid,
        }
      });
    }
    setIsLoading(false);
  }

  return (
    <>
      {
        (parsedCsv.length > 0)
        ? <CsvEditor elements={parsedCsv} onReload={() => setPasedCsv([])} onSave={saveQuizzes}/>
        : <CsvDropzone onDrop={parseCsv} loading={isLoading} />
      }
    </>
  )
}
