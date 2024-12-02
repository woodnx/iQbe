import { paths } from 'api/schema';

import QuizEditForm from '@/components/QuizEditForm';
import { $api } from '@/utils/client';
import { Tabs } from '@mantine/core';

import CsvFileImporter from './CsvFileImporter';

type QuizEditSubmitValues = paths["/quizzes"]["post"]["requestBody"]["content"]["application/json"];

export interface Element {
  question: string,
  answer: string,
  anotherAnswer?: string | null,
}

export default function CreateDashboard() {
  const { mutate } = $api.useMutation("post", "/quizzes");

  const submit = ({ question, answer, category, tags, subCategory, wid, isPublic }: QuizEditSubmitValues) => {
    mutate({ body: {
      question,
      answer,
      category,
      tags,
      subCategory,
      wid,
      isPublic,
    }});
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
            question=''
            answer=''
            mb={16} 
            onSubmit={submit}
          />
        </Tabs.Panel>
        <Tabs.Panel value="file" pt="xs">
          <CsvFileImporter />
        </Tabs.Panel>
      </Tabs>
      
    </>
  )
}