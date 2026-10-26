import type { QuizQuery } from "@/utils/api-types";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";

const useQuizSize = (query: QuizQuery, shouldFetch = true) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["get", "/quizzes/size", { params: { query } }],
    queryFn: ({ signal }) => api.getQuizzesSize({ params: { query } }, signal),
    enabled: shouldFetch,
  });
  return { quizzesSize: data?.size, isLoading, error };
};
export default useQuizSize;
