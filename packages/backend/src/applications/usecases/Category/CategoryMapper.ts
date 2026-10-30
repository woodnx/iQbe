import type {
  CategoryDTO as ApiCategoryDTO,
  SubCategoryDTO as ApiSubCategoryDTO,
} from "@/types/dto.js";

import Category from "@/domains/Category/index.js";

type CategoryDTO = ApiCategoryDTO;

type SubCategoryDTO = ApiSubCategoryDTO;

export const toCategoryDTO = (category: Category): CategoryDTO => ({
  id: category.id,
  name: category.name,
  description: category.description ?? null,
  disabled: category.disabled,
  parentId: category.parentId,
  sub: null,
});

export const toSubCategoryDTO = (category: Category): SubCategoryDTO => ({
  id: category.id,
  name: category.name,
  description: category.description ?? null,
  parentId: category.parentId,
  disabled: category.disabled,
});
