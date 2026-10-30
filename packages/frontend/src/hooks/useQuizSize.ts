import { useQuery } from "@tanstack/react-query";
import type { QuizQuery } from "@/utils/api-types";
import { cleanQuery, readResponse, rpc } from "@/utils/client";

const useQuizSize = (query: QuizQuery, shouldFetch = true) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["get", "/quizzes/size", { params: { query } }],
    queryFn: ({ signal }) =>
      rpc.api.quizzes.size
        .$get({ query: cleanQuery(query) }, { init: { signal: signal } })
        .then(readResponse),
    enabled: shouldFetch,
  });
  return { quizzesSize: data?.size, isLoading, error };
};
export default useQuizSize;
