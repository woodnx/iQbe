import { useQuery } from "@tanstack/react-query";
import { readResponse, rpc } from "@/utils/client";

export const useHistories = (since: string, until: string) => {
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
      rpc.api.histories[":since"][":until"]
        .$get(
          {
            param: {
              since,
              until,
            },
          },
          { init: { signal: signal } },
        )
        .then(readResponse),
  });

  return {
    histories,
    error,
    isLoading,
  };
};
