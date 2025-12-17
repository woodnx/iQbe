import { BoxProps, Button, Center, Group } from "@mantine/core";
import {
  IconChevronsRight,
  IconPlaystationCircle,
  IconX,
} from "@tabler/icons-react";
import { components } from "api/schema";
import { useEffect, useState } from "react";
// import { useTimer, useTypewriter } from "@/hooks";
import { PracticeQuizButton } from "./PracticeQuizButton";
import { PracticeQuizInfo } from "./PracticeQuizInfo";
import { Scene } from "./PracticeSceneChanger";
import { PracticeTypewriteQuiz } from "./PracticeTypewriteQuiz";

type Quiz = components["schemas"]["Quiz"];
export type QuizScene =
  | "preparation"
  | "typewriting"
  | "pressed"
  | "ignored"
  | "judging";

interface Props extends BoxProps {
  quiz: Quiz;
  scene: Scene;
  ignoreLimit: number;
  countLimit: number;
  canTypewrite?: boolean;
  onJudge: (judgement: number, pressedWord: number) => void;
}

export function PracticeQuizController({
  quiz,
  scene,
  ignoreLimit,
  countLimit,
  canTypewrite,
  onJudge,
  ...others
}: Props) {
  const [quizScene, setScene] = useState<QuizScene>("preparation");
  const [pressedWord, setPressedWord] = useState(-1);

  useEffect(() => {
    if (scene == "quizzing") {
      setScene("typewriting");
    }
  }, [scene]);

  useEffect(() => {
    if (quizScene == "preparation") {
      setPressedWord(-1);
    }
  }, [quizScene]);

  const pressed = () => {
    setScene("pressed");
  };

  const judge = (judge: number) => {
    onJudge(judge, pressedWord);
    setScene("preparation");
  };

  return (
    <>
      <PracticeTypewriteQuiz
        question={quiz.question}
        quizScene={quizScene}
        visible={quizScene !== "pressed"}
        ignoreLimit={ignoreLimit}
        countLimit={countLimit}
        onTypewrited={() => setScene("ignored")}
        onIgnored={() => setScene("judging")}
        onCounted={() => setScene("judging")}
        onPressed={(pressedWord) => setPressedWord(pressedWord)}
      />
      <PracticeQuizInfo
        qid={quiz.qid}
        answer={quiz.answer}
        workbook={quiz.workbook || undefined}
        isFavorite={quiz.isFavorite}
        registeredMylist={quiz?.registerdMylist || []}
        visible={quizScene == "judging"}
      />
      <Group justify="center" grow {...others}>
        <Button
          fullWidth
          size="xl"
          color="red"
          onClick={() => judge(1)}
          disabled={quizScene !== "judging" || pressedWord == -1}
        >
          <IconPlaystationCircle />
        </Button>
        <Button
          fullWidth
          size="xl"
          color="gray"
          onClick={() => judge(2)}
          disabled={quizScene !== "judging" || pressedWord >= 0}
        >
          <IconChevronsRight />
        </Button>
        <Button
          fullWidth
          size="xl"
          color="blue"
          onClick={() => judge(0)}
          disabled={quizScene !== "judging" || pressedWord == -1}
        >
          <IconX />
        </Button>
      </Group>
      <Center mt="sm">
        <PracticeQuizButton
          w={280}
          onClick={pressed}
          disabled={quizScene !== "typewriting" && quizScene !== "ignored"}
        />
      </Center>
    </>
  );
}
