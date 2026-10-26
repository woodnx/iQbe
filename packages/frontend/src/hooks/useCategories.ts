import { useQuery } from "@tanstack/react-query";
import { readResponse, rpc } from "@/utils/client";

export const useCategories = () => {
  const {
    data: categories,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["get", "/categories"],
    queryFn: ({ signal }) =>
      rpc.api.categories
        .$get({}, { init: { signal: signal } })
        .then(readResponse),
  });

  return {
    categories,
    isLoading,
    error,
  };
};
