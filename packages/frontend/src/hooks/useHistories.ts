import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";

export const useHistories = (since: number, until: number) => {
  const {
    data: histories,
    error,
    isLoading,
  } = useQuery({
    queryKey: [
      "get",
      "/histories/{since}/{until}",
      {
        params: {
          path: {
            since,
            until,
          },
        },
      },
    ],
    queryFn: ({ signal }) =>
      api.getHistoriesSinceUntil(
        {
          params: {
            path: {
              since,
              until,
            },
          },
        },
        signal,
      ),
  });

  return {
    histories,
    error,
    isLoading,
  };
};
