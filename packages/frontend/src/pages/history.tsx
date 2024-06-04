import { useEffect } from "react";
import QuizViewer from '@/components/QuizViewer';
import useQuizzes from "@/hooks/useQuizzes";
import dayjs from "@/plugins/dayjs";
 
export default function History() {
  const { setParams } = useQuizzes('/history');
  const dates = [
    dayjs().startOf('day').valueOf(),
    dayjs().endOf('day').valueOf(),
  ];

  useEffect(() => {
    setParams({ perPage: 100, since: dates[0], until: dates[1] })
  }, []);

  return (
    <>
      <QuizViewer
        path="/history" 
        isHistory
      />
    </>
  )
}