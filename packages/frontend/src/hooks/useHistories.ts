import useSWR from 'swr';
import axios from '../plugins/axios';

interface HistoriesData {
  right: number | string,
  wrong: number | string,
  through: number | string,
}

const fetcher = (url: string) => axios.get<HistoriesData>(url).then(res => res.data)

export const useHistories = (since: number, until: number) => {
  const { data: histories, isLoading, error } = useSWR(`/histories/${since}/${until}`, fetcher);

  return {
    histories,
    isLoading,
    error
  }
}