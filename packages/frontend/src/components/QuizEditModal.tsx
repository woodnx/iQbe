import { ContextModalProps } from '@mantine/modals';
import QuizEditForm from "./QuizEditForm";
import { SubmitValue } from '@/types';
import axios from '@/plugins/axios';
import useQuizzes from '@/hooks/useQuizzes';

interface Props {
  quizId: number,
  question: string,
  answer: string,
  workbook?: string,
  category?: number,
  subCategory?: number,
  isPublic: boolean,
}

export default function({ context, id, innerProps }: ContextModalProps<Props>) {
  const { quizId, ...formProps } = innerProps;
  const { mutate } = useQuizzes();
  const submit = async ({ question, answer, category, subCategory, workbook, isPublic }: SubmitValue) => {
    await axios.put('/quizzes', {
      id: quizId,
      question,
      answer,
      category: category,
      subCategory: subCategory,
      workbook,
      visible: isPublic ? 1 : 0,
    });
    context.closeModal(id);
    mutate();
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