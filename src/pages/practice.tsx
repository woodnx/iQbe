import { useEffect, useState } from "react";
import { Card, Center, Loader, Overlay, Text } from "@mantine/core";
import PracticeTypewriteQuiz from "../components/PracticeTypewriteQuiz";
import useQuizzes from "../hooks/useQuizzes";
import { KeywordOption, QuizRequestParams } from "../types";
import FilteringModal from "../components/FilteringModal";
import { useTimer, useTypewriter } from "../hooks";
import { useDisclosure } from "@mantine/hooks";
import { PracticeQuizIntro } from "../components/PracticeQuizIntro";
import { PracticeQuizInfo } from "../components/PracticeQuizInfo";
import { PracticeQuizController } from "../components/PracticeQuizController";
import axios from "../plugins/axios";

export default function Practice() {
  const [ params, setParams ] = useState<QuizRequestParams>({perPage: 100});
  const [ nowNumber, setNowNumber ] = useState(0);
  const [ shouldFetch, setShouldFetch ] = useState(true);
  const [ scene, setScene ] = useState(0);
  const [ opened, { open, close } ] = useDisclosure(false);
  const { quizzes } = useQuizzes(params, '', !shouldFetch);
  const [ worngList, setWrongList ] = useState<number[]>();
  const [ pressedWord, setPressedWord ] = useState(0);

  const size = !!quizzes ? quizzes.length : 0;
  const quiz = !!quizzes ? quizzes[nowNumber] : null;

  const delay = useTimer(500, 100, () => setScene(2)); 
  const typewriter = useTypewriter(quiz?.question || "", 100, () => setScene(3));
  const countdown = useTimer(4000, 1000, () => setScene(5)); 
  const through = useTimer(3000, 100, () => setScene(5)); 

  useEffect(() => {
    switch(scene) {
      case 0: 
        delay.reset();
        typewriter.reset();
        countdown.reset();
        through.reset();
        break;
      case 1:
        break;
      case 2:
        typewriter.start();
        break;
      case 3:
        through.start();
        break;
      case 4:
        through.pause();
        typewriter.pause();
        countdown.start();
        setPressedWord(typewriter.text.length)
        break;
      case 5:
        through.stop();
        typewriter.stop()
        break;
    }
  }, [scene])
  
  useEffect(() => {
    open();
    setWrongList(quizzes?.map(quiz => quiz.id));
    setScene(0);
  },[]);

  const toFilter = (
    workbooks?: string[], 
    levels?: string[], 
    keyword?: string, 
    keywordOption?: KeywordOption
  ) => {
    const seed = Math.floor(Math.random() * 100000);
    setParams({ 
      ...params, 
      page: 1, 
      seed,
      workbooks, 
      levels, 
      keyword, 
      keywordOption
    });
    close();
    setShouldFetch(false);
    setScene(1);
  }

  const filterOpen = () => {
    open();
    delay.reset();
    typewriter.reset();
    countdown.reset();
    through.reset();
  }

  const record = async (judgement: number) => {
    if (judgement == 1) {
      await axios.post('/answers', {
        quizId: quiz?.id,
        length: pressedWord,
      });
      setWrongList(worngList?.filter(id => id !== quiz?.id));
    }

    await axios.post('/histories', {
      quizId: quiz?.id,
      judgement,
    });

    setScene(0);
    setNowNumber(p => p+1);
  }

  return (
    <>
      { 
        scene == 0 || scene == 1 ? 
          <Overlay fixed center>
            <Center>
              { 
              scene == 0 && !quiz ? 
                <Loader/> 
              : 
                <PracticeQuizIntro 
                  ta="center"
                  onFinish={delay.start}
                />
              }
            </Center>
          </Overlay> 
        : null
       }
      <FilteringModal
        apply={toFilter}
        opened={opened}
        onOpen={filterOpen}
        onClose={toFilter}
      />
      <Text ta="center">
        <Text span fz={38} fw={700} >{ nowNumber+1 }</Text> 
        <Text span fz={18} fw={500}> / { size }</Text>
      </Text>
      <Card p="md" radius="lg" withBorder>
        <PracticeTypewriteQuiz
          question={typewriter.text}
          visible={scene != 4}
          time={through.time}
          count={countdown.time}
          countlimit={4000}
        />
        <PracticeQuizInfo 
          quizId={quiz?.id || 0}
          answer={quiz?.answer || ""}
          workbookName={quiz?.workbook || ""}
          levelColor={quiz?.level || ""}
          date={quiz?.date || ""}
          isFavorite={quiz?.isFavorite || false}
          visible={scene >= 5}
        />
      </Card>
      <PracticeQuizController
        canJudge={scene == 5}
        canPress={scene == 2 || scene == 3}
        onJudge={(j) => record(j)}
        onPress={() => setScene(4)}
        m="sm"
      />
    </>
  )
}