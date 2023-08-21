import { useState } from "react"
import { Judgement, KeywordOption, QuizRequestParams } from "../types"
import { useDisclosure } from "@mantine/hooks";
import useQuizzes from "../hooks/useQuizzes";
import QuizControllBar from "../components/QuizControllBar";
import FilteringModal from "../components/FilteringModal";
import QuizShuffleButton from "../components/QuizShuffleButton";
import QuizPagination from "../components/QuizPagination";
import QuizList from "../components/QuizList";
import { Center, Grid, Loader } from "@mantine/core";
import HistorySelectJudgement from "../components/HistorySelectJudgement";
import HistoryDateRange from "../components/HistoryDateRange";
import dayjs from "../plugins/dayjs";
import { useHistories } from "../hooks/useHistories";
 
export default function History() {
  const [ activePage, setPage ] = useState(1);
  const [ judgements, setJudgements ] = useState<Judgement[]>([]);
  const [ dates, setDates ] = useState<number[]>([ 
    dayjs().startOf('day').valueOf(),
    dayjs().endOf('day').valueOf(),
  ]);
  const [ params, setParams ] = useState<QuizRequestParams>({ perPage: 100, since: dates[0], until: dates[1] });
  const [ opened, { open, close } ] = useDisclosure(false);
  const { quizzes } = useQuizzes(params, '/history');
  const { histories } = useHistories(dates[0], dates[1]);

  const size = !!quizzes && quizzes.length !== 0 ? quizzes[0].size : 0;
  const right = !!histories ? Number(histories.right) : 0;
  const wrong = !!histories ? Number(histories.wrong) : 0;
  const through = !!histories ? Number(histories.through) : 0;
  
  const toFilter = (
    workbooks?: string[], 
    levels?: string[], 
    keyword?: string, 
    keywordOption?: KeywordOption,
    perPage?: number,
  ) => {
    setPage(1);
    setParams({ 
      ...params, 
      page: 1, 
      seed: undefined,
      perPage,
      workbooks, 
      levels, 
      keyword, 
      keywordOption,
    });
    close();
  }

  const toShuffle = (
    seed: number
  ) => {
    setPage(1);
    setParams({
      ...params,
      page: 1,
      seed,
    });
  }

  const changePage = (
    page: number
  ) => {
    setPage(page)
    setParams({...params, page});
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
        height={!!quizzes && quizzes.length != 0 ? 180 : 140}
        total={size}
        buttons={
          <>
            <FilteringModal
              apply={toFilter}
              opened={opened}
              onOpen={open}
              onClose={close}
            />
            <QuizShuffleButton
              apply={toShuffle}
              ml={7}
            />
          </>
        }
        pagination={
          <>
            <Grid.Col span={12} p={0}>
              <Center mt={0}>
                <HistorySelectJudgement
                  judgements={judgements}
                  right={right}
                  wrong={wrong}
                  throgh={through}
                  onSelect={changeJudgement}
                />
              </Center>
            </Grid.Col>
            <Grid.Col span={12} p={0}>
              <Center mt={0}>
                <HistoryDateRange
                  dates={dates}
                  onChangeDates={changeDates}
                />
              </Center>
            </Grid.Col>
            <Grid.Col span={12}>
              <Center>
                <QuizPagination
                  page={activePage}
                  total={!!params.perPage ? Math.ceil(size / params.perPage) : 0}
                  setPage={changePage}
                />
              </Center>
            </Grid.Col>
          </>
        }
      />
      {!!quizzes ? 
        <>
          <QuizList
            quizzes={quizzes}
            coloring
          />
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