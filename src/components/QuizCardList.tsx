import QuizCard from "./QuizCard"
import useQuizzesStore from "../store/quiz"
import { Center, Loader } from "@mantine/core"

export default function QuizCardList() {
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