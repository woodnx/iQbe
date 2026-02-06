import { components } from "api/schema";

import Category from "@/domains/Category";

type CategoryDTO = components["schemas"]["Category"];

type SubCategoryDTO = components["schemas"]["SubCategory"];

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
