import { QuizRequestParams } from '../types'
import { $api } from '@/utils/client'
import { useQuery, useQueryClient } from '@tanstack/react-query'

const useQuizzes = (
  initialParams: QuizRequestParams = { maxView: 100 },
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
        maxView: params.maxView,
        seed: params.seed,
        wids: params.wids,
        keyword: params.keyword,
        keywordOption: params.keywordOption,
        judgements: params.judgements,
        since: params.since,
        until: params.until,
        mid: params.mid,
        isFavorite: params.isFavorite,
        categories: params.categories,
        tags: params.tags,
        tagMatchAll: params.tagMatchAll,
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