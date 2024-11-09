import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Center, Group, Stack, } from '@mantine/core';
import dayjs from "@/plugins/dayjs";
import QuizList from '@/components/QuizList';
import QuizControllBar from '@/components/QuizControllBar';
import FilteringModal from '@/components/FilteringModal';
import QuizPagination from '@/components/QuizPagination';
import QuizShuffleButton from '@/components/QuizShuffleButton';
import QuizHiddenAnswerButton from '@/components/QuizHiddenAnswerButton';
import { Judgement, KeywordOption, QuizRequestParams } from '@/types';
import useQuizzes, { QuizzesPath } from '@/hooks/useQuizzes';
import { useHistories } from "@/hooks/useHistories";
import HistorySelectJudgement from './HistorySelectJudgement';
import HistoryDateRange from './HistoryDateRange';
import QuizTransfarButton from './QuizTransfarButton';

interface Props {
  path?: QuizzesPath,
  headerCard?: ReactNode,
  isHistory?: boolean,
  initialParams?: QuizRequestParams,
}

export default function({
  path = '',
  initialParams = { perPage: 100 },
  headerCard = <></>,
  isHistory = false,
}: Props) {
  const [ activePage, setPage ] = useState(1);
  const [ isHidden, setIsHidden ] = useState(false);
  const [ judgements, setJudgements ] = useState<Judgement[]>([]);
  const [ dates, setDates ] = useState<number[]>([ 
    dayjs().startOf('day').valueOf(),
    dayjs().endOf('day').valueOf(),
  ]);
  const navigate = useNavigate();
  const { quizzes, params, setParams } = useQuizzes(path, initialParams);
  const { histories } = useHistories(dates[0], dates[1]);
  const right = !!histories ? Number(histories.right) : 0;
  const wrong = !!histories ? Number(histories.wrong) : 0;
  const through = !!histories ? Number(histories.through) : 0;

  const size = !!quizzes && !!quizzes.length ? quizzes[0].size : 0;

  const toFilter = (
    workbooks?: string[], 
    keyword?: string, 
    keywordOption?: KeywordOption,
    perPage?: number,
  ) => {
    setPage(1);
    setParams({ 
      ...params, 
      page: 1, 
      seed: undefined,
      maxView: perPage,
      wids: workbooks, 
      keyword, 
      keywordOption,
    });
  }

  const toShuffle = (
    seed: number
  ) => {
    setPage(1);
    setParams({
      ...params,
      page: 1,
      seed
    });
  }

  const changePage = (
    page: number
  ) => {
    setPage(page);
    setParams({...params, page});
  }

  const toTransfar = () => {
    navigate(`/practice?path=/${path}`);
  }

  const changeJudgement = (
    judgements: Judgement[]
  ) => {
    setJudgements(judgements)
    setParams({
      ...params,
      judgements
    })
  }

  const changeDates = (
    dates: number[],
  ) => {
    setDates(dates);
    setParams({
      ...params,
      since: dates[0],
      until: dates[1]
    })
  }

  return (
    <>
      <QuizControllBar
        p="sm"
        total={size}
        header={headerCard}
        buttons={
          <Group>
            <FilteringModal
              apply={toFilter}
            />
            <QuizShuffleButton
              apply={toShuffle}
            />
            <QuizHiddenAnswerButton
              isHidden={isHidden}
              onToggle={setIsHidden}
            />
            <QuizTransfarButton
              apply={toTransfar}
            />
          </Group>
        }
        pagination={
          <Stack gap={2}>
            {isHistory ? 
            <>
              <Center mt={0}>
                <HistorySelectJudgement
                  judgements={judgements}
                  right={right}
                  wrong={wrong}
                  throgh={through}
                  onSelect={changeJudgement}
                />
              </Center>
              <Center mt={0}>
                <HistoryDateRange
                  dates={dates}
                  onChangeDates={changeDates}
                />
              </Center>
            </>
            : null}
            <Center mt="sm">
              <QuizPagination
                page={activePage}
                total={!!params?.perPage ? Math.ceil(size / params.perPage) : 0}
                setPage={changePage}
              />
            </Center>
          </Stack>
        }
      />
      <QuizList
        quizzes={quizzes}
        page={activePage}
        perPage={params?.perPage || 0}
        isHidden={isHidden}
        coloring={isHistory}
      />  
    </>
  )
}