import { BoxProps, Card, Overlay, Progress, Text } from "@mantine/core";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useEffect } from "react";
import { useIsMobile } from "@/contexts/isMobile";
import { useTimer, useTypewriter } from "@/hooks";
import { QuizScene } from "./PracticeQuizController";

interface Props extends BoxProps {
  question: string;
  quizScene: QuizScene;
  visible: boolean;
  ignoreLimit: number;
  countLimit: number;
  onTypewrited: () => void;
  onIgnored: () => void;
  onCounted: () => void;
  onPressed: (pressedWord: number) => void;
}

export function PracticeTypewriteQuiz({
  question,
  quizScene,
  visible,
  ignoreLimit,
  countLimit,
  onTypewrited,
  onIgnored,
  onCounted,
  onPressed,
}: Props) {
  const isMobile = useIsMobile();

  const typewriter = useTypewriter(question, 100, () => {
    ignoreTimer.start();
    onTypewrited();
  });
  const ignoreTimer = useTimer(ignoreLimit, 100, () => {
    onIgnored();
  });
  const countdownTimer = useTimer(countLimit, 1000, () => {
    onCounted();
  });

  useEffect(() => {
    if (quizScene == "preparation") {
      typewriter.reset();
      ignoreTimer.reset();
      countdownTimer.reset();
    }
    if (quizScene == "typewriting") {
      typewriter.start();
    }
    if (quizScene == "pressed") {
      typewriter.pause();
      ignoreTimer.pause();
      countdownTimer.start();
      onPressed(typewriter.text.length);
    }
    if (quizScene == "judging") {
      typewriter.stop();
      ignoreTimer.stop();
      countdownTimer.stop();
    }
  }, [quizScene]);

  const throughval =
    100 - ((ignoreLimit - ignoreTimer.time) / ignoreLimit) * 100;
  const countval =
    100 - ((countLimit - countdownTimer.time) / countLimit) * 100;

  return (
    <>
      <Progress value={throughval} radius="xs" size="lg" bg="blue.1" striped />
      <Card p="sm" radius="sm" bg="gray.1" mih="7em">
        <Text fz={isMobile ? 15 : 16}>{typewriter.text}</Text>
        {!visible && (
          <Overlay bg="gray.4" opacity={1} center>
            <div style={{ width: 100, height: 100 }}>
              <CircularProgressbar
                value={countval}
                text={`${Math.floor(countdownTimer.time / 1000)}`}
                strokeWidth={14}
                styles={buildStyles({
                  textSize: "30px",
                  textColor: "#228BE6",
                  pathColor: "#228BE6",
                  trailColor: "#ADB5BD",
                })}
              />
            </div>
          </Overlay>
        )}
      </Card>
    </>
  );
}
