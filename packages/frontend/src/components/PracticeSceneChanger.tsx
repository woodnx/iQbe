import { components } from 'api/schema';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FilteringModal from '@/components/FilteringModal';
import FilteringModalButton from '@/components/FilteringModalButton';
import PracticeQuitModal from '@/components/PracticeQuitModal';
import { PracticeQuizController } from '@/components/PracticeQuizController';
import { PracticeQuizInfo } from '@/components/PracticeQuizInfo';
import { PracticeQuizIntro } from '@/components/PracticeQuizIntro';
import PracticeResultModal from '@/components/PracticeResultModal';
import PracticeTypewriteQuiz from '@/components/PracticeTypewriteQuiz';
import { useTimer, useTypewriter } from '@/hooks';
import useQuizzes from '@/hooks/useQuizzes';
import { $api } from '@/utils/client';
import { Card, Group, Loader, Overlay, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

type Quiz = components['schemas']['Quiz'];

interface Props {
  quizzes?: Quiz[],
  size: number,
  shuffledList: number[],
  isTransfer?: boolean,
  onFilter?: () => void,
}

export default function({
  quizzes,
  size,
  shuffledList,
  isTransfer = false,
  onFilter = () => {},
}: Props) {
  const [ nowNumber, setNowNumber ] = useState(0);
  const [ scene, setScene ] = useState(isTransfer ? 0 : -1);
  const [ startTrigger, setStartTrigger ] = useState(isTransfer);
  const [ filtering, filter ] = useDisclosure(false);
  const [ resulted, result ] = useDisclosure(false);
  const navigator = useNavigate();

  const { params, setParams } = useQuizzes();
  const { mutate } = $api.useMutation("post", "/practice");
  const [ rightList, setRightList ] = useState<string[]>([]);
  const [ pressedWord, setPressedWord ] = useState(0);
  const quiz = !!quizzes ? quizzes[shuffledList[nowNumber]] : null;
  const maxQuizSize = quizzes?.length || 0;

  const delay = useTimer(500, 100, () => setScene(1)); 
  const typewriter = useTypewriter(quiz?.question || "", 100, () => setScene(2));
  const countdown = useTimer(4000, 1000, () => setScene(4)); 
  const through = useTimer(3000, 10, () => setScene(4)); 

  useEffect(() => {
    switch(scene) {
      case 0: 
        delay.reset();
        typewriter.reset();
        countdown.reset();
        through.reset();
        result.close();
        break;
      case 1:
        typewriter.start();
        break;
      case 2:
        through.start();
        break;
      case 3:
        through.pause();
        typewriter.pause();
        countdown.start();
        setPressedWord(typewriter.text.length);
        break;
      case 4:
        through.stop();
        typewriter.stop()
        break;
      case 5:
        result.open();
    }
  }, [scene]);

  useEffect(() => {
    if (!isTransfer) filter.open();
    return () => setScene(isTransfer ? 0 : -1);
  },[]);

  const toFilter = (
    wids?: string | string[], 
    keyword?: string, 
    keywordOption?: number,
    categories?: number | number[],
    tags?: string | string[],
    tagMatchAll?: boolean,
    maxView?: number,
  ) => {
    const seed = Math.floor(Math.random() * 100000);
    setParams({ 
      ...params,
      page: 1, 
      maxView,
      seed,
      wids, 
      keyword, 
      keywordOption: Number(keywordOption),
      categories,
      tags,
      tagMatchAll,
      isFavorite: false,
    });
    filter.close();
    onFilter();
    setNowNumber(0);
    setStartTrigger(true);
    setScene(0);
  }

  const record = async (judgement: number) => {
    if (!quiz) return;

    mutate({ body: {
      qid: quiz?.qid,
      judgement,
      pressedWord,
    }});

    if (judgement == 1) {
      const addId = quiz.qid
      !!addId ? setRightList([ ...rightList, addId ]) : null;
    }
  }

  const judgeQuiz = (judgement: number) => {
    record(judgement);
    
    if (nowNumber >= (maxQuizSize-1)) {
      setScene(5);
    } else { 
      setNowNumber(nowNumber+1);
      setScene(0);
    }
  }

  const stopQuiz = async (judgement: number) => {
    await record(judgement);
    navigator('/');
  }

  return (
    <>
      { 
        scene == 0 ? 
          <Overlay fixed center>
            { 
              !quiz || !startTrigger ? 
                <Loader variant="dots"/> 
              : 
                <PracticeQuizIntro 
                  ta="center"
                  onFinish={delay.start}
                />
            }
          </Overlay> 
        : null
      }
      <FilteringModal 
        isFilterKeyword={true}
        opened={filtering}
        onSubmit={toFilter}
        onClose={toFilter}
      />
      <PracticeResultModal
        rightTotal={rightList.length}
        quizzesTotal={maxQuizSize || 1}
        isTransfer={isTransfer}
        canNext={(quizzes && params?.maxView && params?.page) ? Math.ceil(size / params?.maxView) >= params?.page + 1 : false}
        opened={resulted}
        onClose={result.close}
        onRetry={() => setScene(0)}
        onNext={() => {
          setParams({
            ...params,
            page: (!!params?.page) ? params.page + 1 : 0
          });
          setScene(0);
          setNowNumber(0);
        }}
        onTry={filter.open}
        onQuit={() => navigator('/')}
      />
      <Group justify="space-between">
        <FilteringModalButton
          onSubmit={toFilter}
        />
        <PracticeQuitModal
          onJudge={(j) => stopQuiz(j)}
        />
      </Group>
      <Text ta="center">
        <Text span fz={38} fw={700} >{ nowNumber+1 }</Text> 
        <Text span fz={18} fw={500}> / { maxQuizSize }</Text>
      </Text>
      <Card p="md" radius="lg" withBorder>
        <PracticeTypewriteQuiz
          question={typewriter.text}
          visible={scene != 3}
          time={through.time}
          count={countdown.time}
          countlimit={4000}
        />
        <PracticeQuizInfo 
          qid={quiz?.qid}
          answer={quiz?.answer}
          workbook={quiz?.workbook || undefined}
          isFavorite={quiz?.isFavorite}
          registeredMylist={quiz?.registerdMylist || []}
          visible={scene >= 4}
        />
      </Card>
      <PracticeQuizController
        canJudge={scene == 4}
        canPress={scene == 1 || scene == 2}
        onJudge={(j) => judgeQuiz(j)}
        onPress={() => setScene(3)}
        m="sm"
      />
    </>
  )
}