import { Group, Loader, Overlay, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { components } from "api/schema";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilteringModal from "@/components/FilteringModal";
import FilteringModalButton from "@/components/FilteringModalButton";
import PracticeQuitModal from "@/components/PracticeQuitModal";
import { PracticeQuizController } from "@/components/PracticeQuizController";
import { PracticeQuizIntro } from "@/components/PracticeQuizIntro";
import PracticeResultModal from "@/components/PracticeResultModal";
import { useTimer } from "@/hooks";
import useQuizzes from "@/hooks/useQuizzes";
import { $api } from "@/utils/client";

type Quiz = components["schemas"]["Quiz"];
export type Scene = "preparation" | "ready" | "quizzing" | "result";

interface Props {
  quizzes?: Quiz[];
  size: number;
  shuffledList: number[];
  isTransfer?: boolean;
  onFilter?: () => void;
}

export default function ({
  quizzes,
  size,
  shuffledList,
  isTransfer = false,
  onFilter = () => {},
}: Props) {
  const [nowNumber, setNowNumber] = useState(0);
  const [scene, setScene] = useState<Scene>(
    isTransfer ? "ready" : "preparation",
  );
  const [startTrigger, setStartTrigger] = useState(isTransfer);
  const [filtering, filter] = useDisclosure(false);
  const [_, result] = useDisclosure(false);
  const navigator = useNavigate();

  const { params, setParams } = useQuizzes();
  const { mutate } = $api.useMutation("post", "/practice");
  const [rightList, setRightList] = useState<string[]>([]);
  const quiz = !!quizzes ? quizzes[shuffledList[nowNumber]] : null;
  const maxQuizSize = quizzes?.length || 0;

  const delay = useTimer(500, 100, () => setScene("quizzing"));

  useEffect(() => {
    if (!isTransfer) filter.open();
    return () => setScene(isTransfer ? "ready" : "preparation");
  }, []);

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
    setScene("ready");
  };

  const record = async (judgement: number, pressedWord: number) => {
    if (!quiz) return;

    mutate({
      body: {
        qid: quiz?.qid,
        judgement,
        pressedWord,
      },
    });

    if (judgement == 1) {
      const addId = quiz.qid;
      !!addId ? setRightList([...rightList, addId]) : null;
    }
  };

  const judgeQuiz = (judgement: number, pressedWord: number) => {
    record(judgement, pressedWord);

    if (nowNumber >= maxQuizSize - 1) {
      setScene("result");
    } else {
      setNowNumber(nowNumber + 1);
      setScene("ready");
    }
  };

  const stopQuiz = async (judgement: number) => {
    await record(judgement, -1);
    navigator("/");
  };

  return (
    <>
      {scene == "ready" ? (
        <Overlay fixed center>
          {!quiz || !startTrigger ? (
            <Loader variant="dots" />
          ) : (
            <PracticeQuizIntro ta="center" onFinish={delay.start} />
          )}
        </Overlay>
      ) : null}
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
        canNext={
          quizzes && params?.maxView && params?.page
            ? Math.ceil(size / params?.maxView) >= params?.page + 1
            : false
        }
        opened={scene == "result"}
        onClose={result.close}
        onRetry={() => {
          setScene("ready");
          setNowNumber(0);
        }}
        onNext={() => {
          setParams({
            ...params,
            page: !!params?.page ? params.page + 1 : 0,
          });
          setScene("ready");
          setNowNumber(0);
        }}
        onTry={filter.open}
        onQuit={() => navigator("/")}
      />
      <Group justify="space-between">
        <FilteringModalButton onSubmit={toFilter} />
        <PracticeQuitModal onJudge={(j) => stopQuiz(j)} />
      </Group>
      <Text ta="center">
        <Text span fz={38} fw={700}>
          {nowNumber + 1}
        </Text>
        <Text span fz={18} fw={500}>
          {" "}
          / {maxQuizSize}
        </Text>
      </Text>
      {quiz && (
        <PracticeQuizController
          quiz={quiz}
          scene={scene}
          ignoreLimit={3000}
          countLimit={5000}
          onJudge={(j, w) => judgeQuiz(j, w)}
          m="sm"
        />
      )}
    </>
  );
}
