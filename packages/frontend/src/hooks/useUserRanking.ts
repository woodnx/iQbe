import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { Period } from "@/plugins/dayjs";

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
      api.getAnalysisRankingAllPeriod(
        {
          params: {
            path: {
              period,
            },
          },
        },
        signal,
      ),
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
      api.getAnalysisRankingPersonalPeriod(
        {
          params: {
            path: {
              period,
            },
          },
        },
        signal,
      ),
  });

  return {
    personalRank,
    isLoading,
    error,
  };
};
