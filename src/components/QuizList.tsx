import QuizCard from "./Quiz"
import useQuizzesStore from "../store/quiz"
import { Center, Loader } from "@mantine/core"

export default function QuizList() {
  const quizzes = useQuizzesStore(state => state.quizzes)

  if (!quizzes) { 
    return (
      <Center>
        <Loader/>
      </Center>
    )
  }

  return (
    <>
      {quizzes?.map((quiz, idx) => (
        <QuizCard 
          key={quiz.id}
          index={idx + 1}
          quiz={quiz}
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