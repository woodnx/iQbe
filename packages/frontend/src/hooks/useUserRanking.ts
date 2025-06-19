import { Period } from "@/plugins/dayjs";
import { $api } from "@/utils/client";

export const useAllUserRanking = (period: Period) => {
  const {
    data: allUserRanking,
    error,
    isLoading,
  } = $api.useQuery("get", "/analysis/ranking/all/{period}", {
    params: {
      path: {
        period,
      },
    },
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
  } = $api.useQuery("get", "/analysis/ranking/personal/{period}", {
    params: {
      path: {
        period,
      },
    },
  });

  return {
    personalRank,
    isLoading,
    error,
  };
};
