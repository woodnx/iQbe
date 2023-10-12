import QuizCard from "./QuizCard"
import { Quiz } from "../types"
import { useIsMobile } from "../hooks"
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
  const isMobile = useIsMobile();
  const { mylists } = useMylistInfomations();

  return (
    <>
      {quizzes?.map((quiz, idx) => (
        <QuizCard 
          key={`${idx}${isHidden}`}
          // key={idx}
          index={idx+1}
          quiz={quiz}
          mylists={mylists || []}
          coloring={coloring}
          isMobile={isMobile}
          isHidden={isHidden}
          mb={10}
        />
      ))}
    </>
  )
}