import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";

export const useMylists = (shouldFetch = true) => {
  const {
    data: mylists,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["get", "/mylists", {}],
    queryFn: ({ signal }) => api.getMylists({}, signal),
    ...{
      enabled: shouldFetch,
    },
  });

  return {
    mylists,
    error,
    isLoading,
  };
};
