import { paths } from "api/schema";
import { $api } from "@/utils/client";

type QuizSizeRequestParams =
  paths["/quizzes/size"]["get"]["parameters"]["query"] & {};

const useQuizSize = (params: QuizSizeRequestParams, shouldFetch = true) => {
  const { data, error, isLoading } = $api.useQuery("get", "/quizzes/size", {
    params: {
      query: {
        wids: params.wids,
        keyword: params.keyword,
        keywordOption: Number(params.keywordOption),
        judgements: params.judgements,
        since: params.since,
        until: params.until,
        mid: params.mid,
        isFavorite: params.isFavorite,
        categories: params.categories,
        tags: params.tags,
      },
    },
    enabled: shouldFetch,
  });

  return {
    quizzesSize: data?.size,
    isLoading,
    error,
  };
};

export default useQuizSize;
