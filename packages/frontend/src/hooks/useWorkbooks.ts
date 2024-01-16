import useSWR from 'swr';
import axios from '../plugins/axios';
import { Workbook } from '@/types';

const fetcher = (url: string) => axios.get<Workbook[]>(url).then(res => res.data)

export const useWorkbooks = (path = '', shouldFetch = true) => {
  const { data: workbooks, isLoading, error, mutate } = useSWR(
    shouldFetch ? `/workbooks${path}` : null,
    fetcher
  );

  return {
    workbooks,
    isLoading,
    error,
    mutate,
  }
}