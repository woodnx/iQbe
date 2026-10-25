import { components } from "api/schema";

import ICategoryQueryService from "@/applications/queryservices/ICategoryQueryService.js";

type CategoryDTO = components["schemas"]["Category"];

export class GetCategoriesUseCase {
  constructor(private categoryQueryService: ICategoryQueryService) {}

  async execute(): Promise<CategoryDTO[]> {
    return this.categoryQueryService.all();
  }
}
