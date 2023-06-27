import { Pagination } from "@mantine/core";
import { useState } from "react";
import useQuizzesStore from "../store/quiz";

export default function QuizPagination() {
  const [activePage, setPage] = useState(1);
  const quizzes = useQuizzesStore(state => state.quizzes)
  const params = useQuizzesStore(state => state.params)
  const changePage = useQuizzesStore(state => state.changePage)

  const size = !!quizzes && !!params.maxView ? quizzes[0].size / params.maxView : 0
  const setPageAndQuiz = (value: number) => {
    setPage(value)
    changePage(value)
  }

  return (
    <Pagination 
      total={size}
      value={activePage} 
      onChange={setPageAndQuiz}
    />
  )
}