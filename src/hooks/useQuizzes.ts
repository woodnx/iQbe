import useSWR from 'swr'
import axios from '../plugins/axios'
import { Quiz, QuizRequestParams } from '../types'

const fetcher = (url: string, params: string) => (
  axios.get<Quiz[]>(`${url}?${params}`).then(res => res.data)
)

const createFilter = ({
  page,
  perPage,
  seed,
  workbooks,
  levels,
  keyword,
  keywordOption,
} : QuizRequestParams) => {
  const params = new URLSearchParams();

  if(!!page && !!perPage) {
    params.append('page', String(page))
    params.append('maxView', String(perPage))
  }
  if(!!seed) params.append('seed', String(seed))

  if (!!workbooks && workbooks.length !== 0) workbooks.forEach(id => { params.append('workbook[]', id) })
  if (!!levels    && levels.length !== 0)    levels.forEach(id => { params.append('level[]', id) })
  if (!!keyword   && keyword.trim().length !== 0 && !!keywordOption) { 
    params.append("keyword", keyword) 
    params.append("keywordOption", keywordOption) 
  }

  // if (!(crctAnsRatio[0] == 0 && crctAnsRatio[1] == 100)) crctAnsRatio.forEach(ratio => { params.append('crctAnsRatio[]', ratio) }) 
  // params.append('userId', rootState.user.id)

  return params
}

const useQuizzes = (
  params: QuizRequestParams
) => {
  const filter = createFilter(params).toString()
  
  const { data: quizzes, isLoading, error } = useSWR(
    ['/quizzes', filter ],
    ([url, filter]) => fetcher(url, filter)
  )
  
  return {
    quizzes,
    isLoading,
    error
  }
}

export default useQuizzes