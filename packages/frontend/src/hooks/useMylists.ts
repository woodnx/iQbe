import { useQuery } from "@tanstack/react-query";
import { readResponse, rpc } from "@/utils/client";

export const useMylists = (shouldFetch = true) => {
  const {
    data: mylists,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["get", "/mylists", {}],
    queryFn: ({ signal }) =>
      rpc.api.mylists.$get({}, { init: { signal: signal } }).then(readResponse),
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
