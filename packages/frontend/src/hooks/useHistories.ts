import useAspidaSWR from '@aspida/swr';
import api from '@/plugins/api';

export const useHistories = (since: number, until: number) => {
  const { data: histories, error } = useAspidaSWR(api.histories._since(since)._until(until));

  return {
    histories,
    error,
  }
}