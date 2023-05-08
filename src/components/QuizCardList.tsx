import useSWR from "swr"
import { fetcher } from "../hooks"
import QuizCard from "./QuizCard"

interface Quizzes {
  id: number,
  question: string,
  answer: string,
  workbook: string,
  level: string,
  date: Date,
  total: number,
  right: number,
  isFavorite: boolean,
  registerdMylist: number[],
}

export default function QuizCardList() {
  const userId = 8
  const { data: quizList, error } = useSWR<Quizzes[]>(`/quizzes/${userId}`, fetcher)

  if (error)     return <div>faild to load</div>
  if (!quizList) return <div>loading</div>

  return (
    <>
      {quizList?.map(({question, answer}, idx) => (
        <QuizCard 
          key={idx}
          index={idx+1}
          question={question}
          answer={answer}
          styles={(theme) => ({
            root: {
              marginBottom: theme.spacing.xs
            }
          })}
        />
      ))}
    </>
  )
}