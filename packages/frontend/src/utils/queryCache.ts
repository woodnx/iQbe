import { QueryClient, QueryKey } from "@tanstack/react-query";

export const QUIZZES_QUERY_KEY = ["get", "/quizzes"] as const;
export const QUIZ_SIZES_QUERY_KEY = ["get", "/quizzes/size"] as const;
export const MYLISTS_QUERY_KEY = ["get", "/mylists"] as const;
export const WORKBOOKS_QUERY_KEY = ["get", "/workbooks"] as const;
export const ALL_WORKBOOKS_QUERY_KEY = ["get", "/workbooks/all"] as const;

export type QuerySnapshot<T> = Array<[QueryKey, T | undefined]>;

export const takeQuerySnapshot = <T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
): QuerySnapshot<T> => {
  return queryClient.getQueriesData<T>({ queryKey });
};

export const restoreQuerySnapshot = <T>(
  queryClient: QueryClient,
  snapshot: QuerySnapshot<T>,
) => {
  snapshot.forEach(([key, data]) => {
    queryClient.setQueryData(key, data);
  });
};

export const updateRelatedQuizSize = (
  queryClient: QueryClient,
  quizQueryKey: QueryKey,
  delta: number,
) => {
  const params = Array.isArray(quizQueryKey) ? quizQueryKey[2] : undefined;
  const sizeQueryKey: QueryKey = ["get", "/quizzes/size", params];

  queryClient.setQueryData<{ size: number } | undefined>(
    sizeQueryKey,
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        size: Math.max(0, oldData.size + delta),
      };
    },
  );
};
