import useAspidaSWR from '@aspida/swr';
import api from '@/plugins/api';

export const useWorkbooks = (isAll = false, shouldFetch = true) => {
  const { data: workbooks, error, mutate } = useAspidaSWR(
    isAll ? api.workbooks.all : api.workbooks, {
    enabled: shouldFetch,
  });

  return {
    workbooks,
    error,
    mutate,
  }
}