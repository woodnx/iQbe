import type { CategoryDTO as ApiCategoryDTO } from "@/types/dto.js";

export type CategoryDTO = ApiCategoryDTO;

export default interface ICategoryQueryService {
  available(): Promise<CategoryDTO[]>;
  all(): Promise<CategoryDTO[]>;
}
