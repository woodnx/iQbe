import QuizCard from "./QuizCard"
import { Quiz } from "../types"
import { useIsMobile } from "../hooks"
import { useMylistInfomations } from "../hooks/useMylists";

interface QuizListProps {
  quizzes: Quiz[],
  coloring?: boolean,
}

export default function QuizList({
  quizzes,
  coloring,
}: QuizListProps) {
  const isMobile = useIsMobile();
  const { mylists } = useMylistInfomations();

  return (
    <>
      {quizzes?.map((quiz, idx) => (
        <QuizCard 
          key={idx}
          index={idx+1}
          quiz={quiz}
          mylists={mylists || []}
          coloring={coloring}
          isMobile={isMobile}
          mb={10}
        />
      ))}
    </>
  )
}