import { useQuery } from "@tanstack/react-query";
import { readResponse, rpc } from "@/utils/client";
export const useWorkbooks = (isAll = false, shouldFetch = true) => {
  const {
    data: workbooks,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["get", isAll ? "/workbooks/all" : "/workbooks", {}],
    queryFn: ({ signal }) =>
      isAll
        ? rpc.api.workbooks.all
            .$get({}, { init: { signal: signal } })
            .then(readResponse)
        : rpc.api.workbooks
            .$get({}, { init: { signal: signal } })
            .then(readResponse),
    enabled: shouldFetch,
  });
  return { workbooks, isLoading, error };
};
