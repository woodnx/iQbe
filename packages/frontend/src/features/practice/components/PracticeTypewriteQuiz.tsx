import { useIsMobile } from "@/contexts/isMobile";
import { useTimer, useTypewriter } from "@/hooks";
import {
  BoxProps,
  Card,
  Overlay,
  Progress,
  RingProgress,
  Text,
} from "@mantine/core";
import { useEffect, useEffectEvent } from "react";
import "react-circular-progressbar/dist/styles.css";
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

  const ignoreTimer = useTimer(ignoreLimit, 100, () => {
    onIgnored();
  });
  const typewriter = useTypewriter(question, 100, () => {
    ignoreTimer.start();
    onTypewrited();
  });
  const countdownTimer = useTimer(countLimit, 1000, () => {
    onCounted();
  });

  const onSceneChanged = useEffectEvent((scene: QuizScene) => {
    if (scene === "preparation") {
      typewriter.reset();
      ignoreTimer.reset();
      countdownTimer.reset();
    }
    if (scene === "typewriting") {
      typewriter.start();
    }
    if (scene === "pressed") {
      typewriter.pause();
      ignoreTimer.pause();
      countdownTimer.start();
      onPressed(typewriter.text.length);
    }
    if (scene === "judging") {
      typewriter.stop();
      ignoreTimer.stop();
      countdownTimer.stop();
    }
  });

  useEffect(() => {
    onSceneChanged(quizScene);
  }, [quizScene]);

  const throughval =
    100 - ((ignoreLimit - ignoreTimer.time) / ignoreLimit) * 100;
  const countval =
    100 - ((countLimit - countdownTimer.time) / countLimit) * 100;

  return (
    <>
      <Progress
        value={throughval}
        size="lg"
        bg="gray.4"
        color="gray"
        striped
        style={{ borderRadius: "10px 10px 0 0" }}
      />
      <Card
        p="sm"
        bg="gray.1"
        mih="10em"
        style={{ borderRadius: "0 0 15px 15px" }}
      >
        <Text fz={isMobile ? 15 : 16}>{typewriter.text}</Text>
        {!visible && (
          <Overlay bg="gray.4" opacity={1} center>
            {/* <div style={{ width: 100, height: 100 }}>
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
            </div> */}
            <RingProgress
              size={140}
              thickness={17}
              roundCaps
              sections={[
                {
                  value: countval,
                  color: "blue",
                },
              ]}
              transitionDuration={250}
              label={
                <Text c="blue" fw={700} fz={30} ta="center">
                  {Math.floor(countdownTimer.time / 1000)}
                </Text>
              }
            />
          </Overlay>
        )}
      </Card>
    </>
  );
}
