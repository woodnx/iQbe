import useAspidaSWR from '@aspida/swr';
import api from '@/plugins/api';

export const useMylists = (shouldFetch = true) => {
  const { data: mylists, error, mutate } = useAspidaSWR(api.mylists, {
    enabled: shouldFetch
  });

  return {
    mylists,
    error,
    mutate,
  };
};