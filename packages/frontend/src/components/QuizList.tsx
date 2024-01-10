import { Quiz } from "@/types"
import { useMylists } from "@/hooks/useMylists";
import QuizCard from "./QuizCard"
import { Center, Loader } from "@mantine/core";

interface QuizListProps {
  quizzes?: Quiz[],
  isHidden?: boolean,
  coloring?: boolean,
}

export default function QuizList({
  quizzes,
  isHidden = false,
  coloring = false,
}: QuizListProps) {
  const { mylists } = useMylists();

  return (
    <>
    {
      !!quizzes 
      ?
      <>
      {
        quizzes.map((quiz, idx) => (
          <QuizCard 
            key={`${idx}${isHidden}`}
            index={idx+1}
            quiz={quiz}
            mylists={mylists || []}
            coloring={coloring}
            isHidden={isHidden}
            mb={10}
          />
        ))
      }
      { quizzes.length == 0 ? <Center>No data</Center> : null }
      </>
      : 
      <Center>
        <Loader variant="dots"/>
      </Center>
    }
    </>
  )
}