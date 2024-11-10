import { ContextModalProps } from '@mantine/modals';
import QuizEditForm from "./QuizEditForm";
import { SubmitValue } from '@/types';
import { $api } from '@/utils/client';

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
  const submit = async ({ question, answer, tags, category, subCategory, workbook, isPublic }: SubmitValue) => {
    mutate({ 
      body: {
        question,
        answer,
        category: category,
        subCategory: subCategory,
        tags,
        wid: workbook,
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