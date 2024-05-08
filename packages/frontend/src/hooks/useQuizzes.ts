import useSWR from 'swr'
import axios from '../plugins/axios'
import { QuizRequestParams } from '../types'
import useAspidaSWR from '@aspida/swr'
import api from '@/plugins/api'
import { Quiz } from 'api/types'

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
    params.append('maxView', String(perPage))
  }
  if(!!seed) params.append('seed', String(seed))

  if (!!workbooks && workbooks.length !== 0) workbooks.forEach(id => { params.append('workbooks[]', id) })
  if (!!levels    && levels.length !== 0)    levels.forEach(id => { params.append('levels[]', id) })
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
  path = '',
  initialParams: QuizRequestParams = { perPage: 100 },
  shouldFetch = true,
) => {
  const { data: params, mutate: setParams } = useSWR<QuizRequestParams>('params', null, { fallbackData: initialParams});
  const filter = createFilter(params || {}).toString();

  const { data: quizzes, isLoading, error, mutate } = useSWR(
    shouldFetch ? [`/quizzes${path}`, filter ] : null,
    ([url, filter]) => fetcher(url, filter)
  );

  useAspidaSWR(api.quizzes)

  return {
    quizzes,
    isLoading,
    error,
    mutate,
    params,
    setParams,
  }
}

export default useQuizzes