import useSWR from 'swr';
import axios from '../plugins/axios';
import { MylistInformation } from '../types';

const fetcher = (url: string) => axios.get<MylistInformation[]>(url).then(res => res.data); 

export const useMylists = (shouldFetch = true) => {
  const { data: mylists, isLoading, error, mutate } = useSWR(
    shouldFetch ? '/mylists' : null, 
  fetcher);

  return {
    mylists,
    isLoading,
    error,
    mutate
  };
};