import QuizCard from "./QuizCard"
import axios from "../axios"
import { useEffect, useState } from "react"
// import { useFetch } from "../hooks"

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
  const [ quizList, setList ] = useState<Quizzes[]>()
  // const { data: quizList } = useFetch<Quizzes[]>(`/quizzes/${userId}`)

  useEffect(() => {
    axios.get<Quizzes[]>(`/quizzes/${userId}`)
    .then(res => res.data)
    .then(setList)
  }, [])

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