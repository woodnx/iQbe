import { useEffect } from 'react';
import QuizViewer from '@/components/QuizViewer';
import useQuizzes from '@/hooks/useQuizzes';

export default function Search() {
  const { setParams } = useQuizzes();
  
  useEffect(() => {
    setParams({ perPage: 100 })
  }, []);

  return (
    <>
      <QuizViewer />
    </>
  )
}