import { $api } from '@/utils/client';

export const useHistories = (since: number, until: number) => {
  const  { data: histories, error, isLoading } = $api.useQuery("get", "/histories/{since}/{until}", {
    params: {
      path: {
        since,
        until,
      },
    },
  });

  return {
    histories,
    error,
    isLoading,
  }
}