import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
export const useWorkbooks = (isAll = false, shouldFetch = true) => {
  const {
    data: workbooks,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["get", isAll ? "/workbooks/all" : "/workbooks", {}],
    queryFn: ({ signal }) =>
      isAll ? api.getWorkbooksAll({}, signal) : api.getWorkbooks({}, signal),
    enabled: shouldFetch,
  });
  return { workbooks, isLoading, error };
};
