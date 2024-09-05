import QuizEditForm from '@/components/QuizEditForm';
import { $api } from "@/utils/client";
import { SubmitValue } from '@/types';
import { Tabs } from '@mantine/core';
import CsvFileImporter from './CsvFileImporter';

export interface Element {
  question: string,
  answer: string,
  anotherAnswer?: string | null,
}

export default function CreateDashboard() {
  const { mutate } = $api.useMutation("post", "/quizzes");

  const submit = ({ question, answer, category, subCategory, workbook, isPublic }: SubmitValue) => {
    mutate({ body: {
      question,
      answer,
      category,
      subCategory,
      wid: workbook,
      isPublic,
    }});
  };

  return (
    <>
      <Tabs defaultValue="single">
        <Tabs.List grow>
          <Tabs.Tab value="single">Single</Tabs.Tab>
          <Tabs.Tab value="file">CSV file</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="single" pt="xs">
          <QuizEditForm mb={16} onSubmit={submit}/>
        </Tabs.Panel>
        <Tabs.Panel value="file" pt="xs">
          <CsvFileImporter />
        </Tabs.Panel>
      </Tabs>
      
    </>
  )
}