import QuizCard from "./QuizCard"
import { Quiz } from "../types"

interface QuizListProps {
  quizzes: Quiz[],
  coloring?: boolean,
}

export default function QuizList({
  quizzes,
  coloring,
}: QuizListProps) {
  return (
    <>
      {quizzes?.map((quiz, idx) => (
        <QuizCard 
          key={idx}
          index={idx+1}
          quiz={quiz}
          coloring={coloring}
          mb={10}
        />
      ))}
    </>
  )
}