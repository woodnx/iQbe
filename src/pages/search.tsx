import QuizList from '../components/QuizList'
import QuizControllBar from '../components/QuizControllBar'
import useQuizzes from '../hooks/useQuizzes'
import { Center, Loader } from '@mantine/core'
import FilteringModal from '../components/FilteringModal'
import { KeywordOption, QuizRequestParams } from '../types'
import { useState } from 'react'
import QuizPagination from '../components/QuizPagination'
import QuizShuffleButton from '../components/QuizShuffleButton'
import { useDisclosure } from '@mantine/hooks'

export default function Search() {
  const [ params, setParams ] = useState<QuizRequestParams>({perPage: 100})
  const [activePage, setPage] = useState(1);
  const [ opened, { open, close } ] = useDisclosure(false);
  const { quizzes } = useQuizzes(params)

  const size = !!quizzes ? quizzes[0].size : 0

  const toFilter = (
    workbooks?: string[], 
    levels?: string[], 
    keyword?: string, 
    keywordOption?: KeywordOption
  ) => {
    setPage(1)
    setParams({ 
      ...params, 
      page: 1, 
      seed: undefined,
      workbooks, 
      levels, 
      keyword, 
      keywordOption
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
          <>
            <FilteringModal
              apply={toFilter}
              opened={opened}
              open={open}
              close={close}

            />
            <QuizShuffleButton
              apply={toShuffle}
              ml={7}
            />
          </>
        }
        pagination={
        <QuizPagination
          page={activePage}
          total={!!params.perPage ? size / params.perPage : 0}
          setPage={changePage}
        />}
      />
      {!!quizzes ? 
        <QuizList
          quizzes={quizzes}
        /> 
      : 
        <Center>
          <Loader variant="dots"/>
        </Center>
      }
    </>
  )
}