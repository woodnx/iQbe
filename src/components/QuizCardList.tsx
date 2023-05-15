import QuizCard from "./QuizCard"
import { useEffect } from "react"
import useQuizzesStore from "../store/quiz"
import { Center, Loader } from "@mantine/core"
// import { useFetch } from "../hooks"

export default function QuizCardList() {
  const quizzes = useQuizzesStore(state => state.quizzes)
  const getQuizzes = useQuizzesStore(state => state.getQuiz)

  useEffect(() => {
    getQuizzes()
  }, [])

  if (!quizzes) { 
    return (
      <Center>
        <Loader/>
      </Center>
    )
  }

  return (
    <>
      {quizzes?.map(({question, answer}, idx) => (
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