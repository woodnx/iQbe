import axios from "@/plugins/axios"
import { Category, SubCategory } from "@/types";
import useSWR from "swr"

const fetcher = <T>(url: string) => axios.get<T>(url).then(res => res.data)

export const useCategories = () => {
  const { data: categories, isLoading, error } = useSWR<Category[]>(`/categories`, fetcher);

  return {
    categories,
    isLoading,
    error,
  }
}

export const useSubCategories = () => {
  const { data: subCategories, isLoading, error } = useSWR<SubCategory[]>(`/categories/sub`, fetcher);

  return {
    subCategories,
    isLoading,
    error,
  }
}