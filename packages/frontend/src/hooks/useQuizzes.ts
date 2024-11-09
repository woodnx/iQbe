import { QuizRequestParams } from '../types'
import { $api } from '@/utils/client'
import { useQuery, useQueryClient } from '@tanstack/react-query'

const useQuizzes = (
  initialParams: QuizRequestParams = { perPage: 100 },
  shouldFetch = true,
) => {
  const { data: params, } = useQuery({
    queryKey: ['params'],
    initialData: initialParams,
  });
  const queryClient = useQueryClient();
  const setParams = (v: QuizRequestParams) => {
    queryClient.setQueryData(['params'], v);
  };

  const { data: quizzes, error, isLoading } = $api.useQuery('get', `/quizzes`, {
    params: {
      query: {
        page: params.page,
        maxView: params.perPage,
        seed: params.seed,
        workbooks: params.workbooks,
        keyword: params.keyword,
        keywordOption: Number(params.keywordOption),
        judement: params.judgements,
        since: params.since,
        until: params.until
      }
    },
    enabled: shouldFetch,
  })

  return {
    quizzes,
    isLoading,
    error,
    params,
    setParams,
  }
}

export default useQuizzes