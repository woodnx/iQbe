import QuizList from '../components/QuizList'
import QuizControllBar from '../components/QuizControllBar'
import useQuizzes from '../hooks/useQuizzes'
import { Center, Grid, Group, Loader } from '@mantine/core'
import FilteringModal from '../components/FilteringModal'
import { KeywordOption, QuizRequestParams } from '../types'
import { useState } from 'react'
import QuizPagination from '../components/QuizPagination'
import QuizShuffleButton from '../components/QuizShuffleButton'

export default function Search() {
  const [ params, setParams ] = useState<QuizRequestParams>({perPage: 100})
  const [activePage, setPage] = useState(1);
  const { quizzes } = useQuizzes(params)

  const size = !!quizzes && !!quizzes.length ? quizzes[0].size : 0

  const toFilter = (
    workbooks?: string[], 
    levels?: string[], 
    keyword?: string, 
    keywordOption?: KeywordOption,
    perPage?: number,
  ) => {
    setPage(1)
    setParams({ 
      ...params, 
      page: 1, 
      seed: undefined,
      perPage,
      workbooks, 
      levels, 
      keyword, 
      keywordOption,
    })
  }

  const toShuffle = (
    seed: number
  ) => {
    setPage(1)
    setParams({
      ...params,
      page: 1,
      seed
    })
  }

  const changePage = (
    page: number
  ) => {
    setPage(page)
    setParams({...params, page})
  }

  return (
    <>
      <QuizControllBar
        height={!!quizzes ? 110 : 60}
        total={size}
        buttons={
          <Group>
            <FilteringModal
              apply={toFilter}
            />
            <QuizShuffleButton
              apply={toShuffle}
            />
          </Group>
        }
        pagination={
          <Grid.Col mb={5}>
            <Center>
              <QuizPagination
                page={activePage}
                total={!!params.perPage ? Math.ceil(size / params.perPage) : 0}
                setPage={changePage}
              />
            </Center>
          </Grid.Col>
        }
      />
      {!!quizzes ? 
        <>
          <QuizList
            quizzes={quizzes}
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