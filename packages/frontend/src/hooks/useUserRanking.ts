import useAspidaSWR from "@aspida/swr";
import api from "@/plugins/api";
import { Period } from "@/plugins/dayjs";

export const useAllUserRanking = (period: Period) => {
  const { data: allUserRanking, isLoading, error } = useAspidaSWR(api.analysis.ranking.all._period(period));
  
  return {
    allUserRanking,
    isLoading,
    error,
  };
}

export const usePersonalRank = (period: Period) => {
  const { data: personalRank, isLoading, error } = useAspidaSWR(api.analysis.ranking.personal._period(period));
  
  return {
    personalRank,
    isLoading,
    error,
  };
}