import { $api } from "@/utils/client";

export const useMylists = (shouldFetch = true) => {
  const { data: mylists, error, isLoading } = $api.useQuery("get", "/mylists", {}, {
    enabled: shouldFetch,
  });

  return {
    mylists,
    error,
    isLoading,
  };
};