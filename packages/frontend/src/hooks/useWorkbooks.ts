import useSWR from 'swr';
import axios from '../plugins/axios';
import { WorkbooksData } from '@/types';

const fetcher = (url: string) => axios.get<WorkbooksData[]>(url).then(res => res.data)

export const useWorkbooks = (shouldFetch = true) => {
  const { data: workbooks, isLoading, error, mutate } = useSWR(
    shouldFetch ? '/workbooks/user' : null,
    fetcher
  );

  return {
    workbooks,
    isLoading,
    error,
    mutate,
  }
}