import type { CategoryDTO as ApiCategoryDTO } from "@/types/dto.js";

import ICategoryQueryService from "@/applications/queryservices/ICategoryQueryService.js";

type CategoryDTO = ApiCategoryDTO;

export class GetCategoriesUseCase {
  constructor(private categoryQueryService: ICategoryQueryService) {}

  async execute(): Promise<CategoryDTO[]> {
    return this.categoryQueryService.all();
  }
}
