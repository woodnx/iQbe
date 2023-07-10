import QuizList from '../components/QuizList'
import QuizControllBar from '../components/QuizControllBar'
import useQuizzes from '../hooks/useQuizzes'
import { Center, Loader } from '@mantine/core'
import FilteringModal from '../components/FilteringModal'
import { KeywordOption, QuizRequestParams } from '../types'
import { useState } from 'react'
import QuizPagination from '../components/QuizPagination'

export default function Search() {
  const [ params, setParams ] = useState<QuizRequestParams>({perPage: 100})
  const [activePage, setPage] = useState(1);
  const { quizzes } = useQuizzes(params, '/favorite')

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
      workbooks, 
      levels, 
      keyword, 
      keywordOption
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
        height={100}
        total={size}
        buttons={
          <FilteringModal
            apply={toFilter}
          />
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