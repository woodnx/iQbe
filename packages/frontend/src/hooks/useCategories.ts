import axios from "@/plugins/axios"
import useSWR from "swr"

interface CategoriesData {
  id: number,
  name: string,
  description: string,
}

interface SubCategoriesData {
  id: number,
  name: string,
  description: string,
  parent_id: number,
}

const fetcher = <T>(url: string) => axios.get<T>(url).then(res => res.data)

export const useCategories = () => {
  const { data: categories, isLoading, error } = useSWR<CategoriesData[]>(`/categories`, fetcher);

  return {
    categories,
    isLoading,
    error,
  }
}

export const useSubCategories = () => {
  const { data: subCategories, isLoading, error } = useSWR<SubCategoriesData[]>(`/categories/sub`, fetcher);

  return {
    subCategories,
    isLoading,
    error,
  }
}