import { ContextModalProps } from '@mantine/modals';
import QuizEditForm from "./QuizEditForm";
import { SubmitValue } from '@/types';
import { $api } from '@/utils/client';

interface Props {
  qid: string,
  question: string,
  answer: string,
  workbook?: string,
  category?: number,
  subCategory?: number,
  tags?: string[],
  isPublic: boolean,
}

export default function({ context, id, innerProps }: ContextModalProps<Props>) {
  const { qid, ...formProps } = innerProps;
  const { mutate } = $api.useMutation("put", "/quizzes");
  const submit = async ({ question, answer, tags, category, subCategory, workbook, isPublic }: SubmitValue) => {
    mutate({ body: {
      qid,
      question,
      answer,
      category: category,
      subCategory: subCategory,
      tags,
      wid: workbook,
      isPublic,
    }});
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