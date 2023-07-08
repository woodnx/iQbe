import QuizList from '../components/QuizList'
import QuizControllBar from '../components/QuizControllBar'
import useQuizzes from '../hooks/useQuizzes'
import { Center, Loader } from '@mantine/core'
import FilteringModal from '../components/FilteringModal'
import { KeywordOption, QuizRequestParams } from '../types'
import { useState } from 'react'

export default function Search() {
  const [ params, setParams ] = useState<QuizRequestParams>({})
  const { quizzes } = useQuizzes(params)

  const toFilter = (
    workbooks?: string[], 
    levels?: string[], 
    keyword?: string, 
    keywordOption?: KeywordOption
  ) => {
    setParams({ ...params, workbooks, levels, keyword, keywordOption })
  }

  return (
    <>
      <QuizControllBar
        height={100}
        contents={
          <FilteringModal
            apply={toFilter}
          />
        }
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