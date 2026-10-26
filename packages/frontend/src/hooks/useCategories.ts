import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";

export const useCategories = () => {
  const {
    data: categories,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["get", "/categories"],
    queryFn: ({ signal }) => api.getCategories({}, signal),
  });

  return {
    categories,
    isLoading,
    error,
  };
};
