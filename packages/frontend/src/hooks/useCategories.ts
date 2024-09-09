import useAspidaSWR from '@aspida/swr';
import api from '@/plugins/api';

export const useCategories = () => {
  const { data: categories, isLoading, error } = useAspidaSWR(api.categories);

  return {
    categories,
    isLoading,
    error,
  }
}

export const useSubCategories = () => {
  const { data: subCategories, isLoading, error } = useAspidaSWR(api.categories.sub);

  return {
    subCategories,
    isLoading,
    error,
  }
}