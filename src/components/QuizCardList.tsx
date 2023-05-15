import QuizCard from "./QuizCard"
import { useEffect } from "react"
import useQuizzesStore from "../store/quiz"
// import { useFetch } from "../hooks"

export default function QuizCardList() {
  const quizzes = useQuizzesStore(state => state.quizzes)
  const getQuizzes = useQuizzesStore(state => state.getQuiz)

  useEffect(() => {
    getQuizzes()
  }, [])

  if (!quizzes) { 
    return <div>loading</div>
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