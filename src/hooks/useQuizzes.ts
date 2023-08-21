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
  since,
  until,
  judgements,
} : QuizRequestParams) => {
  const params = new URLSearchParams();

  if(!!page && !!perPage) {
    params.append('page', String(page))
    params.append('perPage', String(perPage))
  }
  if(!!seed) params.append('seed', String(seed))

  if (!!workbooks && workbooks.length !== 0) workbooks.forEach(id => { params.append('workbook[]', id) })
  if (!!levels    && levels.length !== 0)    levels.forEach(id => { params.append('level[]', id) })
  if (!!keyword   && keyword.trim().length !== 0 && !!keywordOption) { 
    params.append("keyword", keyword) 
    params.append("keywordOption", keywordOption)
  }

  if (!!since && !!until) { 
    params.append("since", String(since));
    params.append("until", String(until));
  }

  if (!!judgements) judgements.forEach(j => { params.append('judgement[]', String(j)) });

  // if (!(crctAnsRatio[0] == 0 && crctAnsRatio[1] == 100)) crctAnsRatio.forEach(ratio => { params.append('crctAnsRatio[]', ratio) }) 
  // params.append('userId', rootState.user.id)

  return params
}

const useQuizzes = (
  params: QuizRequestParams,
  path = '',
  shouldFetch = true,
) => {
  const filter = createFilter(params).toString()
  
  const { data: quizzes, isLoading, error } = useSWR(
    shouldFetch ? [`/quizzes${path}`, filter ] : null,
    ([url, filter]) => fetcher(url, filter)
  )
  
  return {
    quizzes,
    isLoading,
    error
  }
}

export default useQuizzes