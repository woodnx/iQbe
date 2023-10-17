import QuizCard from "./QuizCard"
import { Quiz } from "../types"
import { useMylistInfomations } from "../hooks/useMylists";

interface QuizListProps {
  quizzes: Quiz[],
  isHidden?: boolean,
  coloring?: boolean,
}

export default function QuizList({
  quizzes,
  isHidden = false,
  coloring = false,
}: QuizListProps) {
  const { mylists } = useMylistInfomations();

  return (
    <>
      {quizzes?.map((quiz, idx) => (
        <QuizCard 
          key={`${idx}${isHidden}`}
          index={idx+1}
          quiz={quiz}
          mylists={mylists || []}
          coloring={coloring}
          isHidden={isHidden}
          mb={10}
        />
      ))}
    </>
  )
}