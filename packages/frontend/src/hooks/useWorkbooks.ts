import { $api } from '@/utils/client';

export const useWorkbooks = (isAll = false, shouldFetch = true) => {
  const { data: workbooks, error, isLoading } = $api.useQuery("get", 
    isAll ? "/workbooks/all" : "/workbooks", {}, {
    enabled: shouldFetch,
  });

  return {
    workbooks,
    error,
    isLoading,
  }
}