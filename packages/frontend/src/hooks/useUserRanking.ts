import axios from "../plugins/axios";
import useSWR from 'swr';
import { Period } from "../plugins/dayjs";
import { Rank } from "../types";

const fetcher = (url: string) => (
  axios.get(url).then(res => res.data)
)

export const useAllUserRanking = (period: Period) => {
  const { data: allUserRanking, isLoading, error } = useSWR<Rank[]>(`analysis/ranking/all/${period}`, fetcher);
  
  return {
    allUserRanking,
    isLoading,
    error,
  };
}

export const usePersonalRank = (period: Period) => {
  const { data: personalRank, isLoading, error } = useSWR<Rank>(`analysis/ranking/personal/${period}`, fetcher);
  
  return {
    personalRank,
    isLoading,
    error,
  };
}