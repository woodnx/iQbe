import QuizCard from "./QuizCard"
import { Quiz } from "../types"

interface QuizListProps {
  quizzes: Quiz[]
}

export default function QuizList(props: QuizListProps) {
  return (
    <>
      {props.quizzes?.map((quiz, idx) => (
        <QuizCard 
          key={idx}
          index={idx+1}
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