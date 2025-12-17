import QuizCard from "./QuizCard";
import { Center, Loader } from "@mantine/core";
import { components } from "api/schema";

type Quiz = components["schemas"]["Quiz"];

interface QuizListProps {
  quizzes?: Quiz[];
  page: number;
  perPage: number;
  isHidden?: boolean;
  coloring?: boolean;
}

export default function QuizList({
  quizzes,
  page,
  perPage,
  isHidden = false,
  coloring = false,
}: QuizListProps) {
  return (
    <>
      {!!quizzes ? (
        <>
          {quizzes.map((quiz, idx) => (
            <QuizCard
              key={`${idx}${isHidden}`}
              index={(page - 1) * perPage + idx + 1}
              quiz={quiz}
              coloring={coloring}
              isHidden={isHidden}
              mb={10}
            />
          ))}
          {quizzes.length == 0 ? (
            <Center>何も見つかりませんでした...😢</Center>
          ) : null}
        </>
      ) : (
        <Center>
          <Loader variant="dots" />
        </Center>
      )}
    </>
  );
}
