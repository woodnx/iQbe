import { useQuery } from "@tanstack/react-query";
import { Period } from "@/plugins/dayjs";
import { readJsonResponse, rpc } from "@/utils/client";

export const useAllUserRanking = (period: Period) => {
  const {
    data: allUserRanking,
    error,
    isLoading,
  } = useQuery({
    queryKey: [
      "get",
      "/analysis/ranking/all/{period}",
      {
        params: {
          path: {
            period,
          },
        },
      },
    ],
    queryFn: ({ signal }) =>
      rpc.api.analysis.ranking.all[":period"]
        .$get(
          {
            param: {
              period,
            },
            query: {},
          },
          { init: { signal: signal } },
        )
        .then(readJsonResponse),
  });

  return {
    allUserRanking,
    isLoading,
    error,
  };
};

export const usePersonalRank = (period: Period) => {
  const {
    data: personalRank,
    error,
    isLoading,
  } = useQuery({
    queryKey: [
      "get",
      "/analysis/ranking/personal/{period}",
      {
        params: {
          path: {
            period,
          },
        },
      },
    ],
    queryFn: ({ signal }) =>
      rpc.api.analysis.ranking.personal[":period"]
        .$get(
          {
            param: {
              period,
            },
          },
          { init: { signal: signal } },
        )
        .then(readJsonResponse),
  });

  return {
    personalRank,
    isLoading,
    error,
  };
};
