import { paths } from 'api/schema';

import { $api } from '@/utils/client';
import { ContextModalProps } from '@mantine/modals';

import QuizEditForm from './QuizEditForm';

type QuizEditSubmitValues = paths["/quizzes"]["post"]["requestBody"]["content"]["application/json"];

interface Props {
  qid: string,
  question: string,
  answer: string,
  wid?: string,
  category?: number,
  subCategory?: number,
  tags?: string[],
  isPublic: boolean,
}

export default function({ context, id, innerProps }: ContextModalProps<Props>) {
  const { qid, ...formProps } = innerProps;
  const { mutate } = $api.useMutation("put", "/quizzes/{qid}");
  const submit = async ({ question, answer, tags, category, subCategory, wid, isPublic }: QuizEditSubmitValues) => {
    mutate({ 
      body: {
        question,
        answer,
        category,
        subCategory,
        tags,
        wid,
        isPublic,
      },
      params: { path: { qid } }
    });
    context.closeModal(id);
  }

  return (
    <>
      <QuizEditForm 
        {...formProps}
        onSubmit={(v) => submit(v)}
      />
    </>
  )
}