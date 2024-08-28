import { $api } from '@/utils/client';

export const useCategories = () => {
  const  { data: categories, error, isLoading } = $api.useQuery("get", "/categories");

  return {
    categories,
    isLoading,
    error,
  }
}

export const useSubCategories = () => {
  const  { data: subCategories, error, isLoading } = $api.useQuery("get", "/categories/sub");

  return {
    subCategories,
    isLoading,
    error,
  }
}
