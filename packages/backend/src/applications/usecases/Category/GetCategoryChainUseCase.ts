import { components } from "api/schema";

import ICategoryRepository from "@/domains/Category/ICategoryRepository";

import { toCategoryDTO } from "./CategoryMapper";

type CategoryDTO = components["schemas"]["Category"];

export type GetCategoryChainUseCaseCommand = {
  id: number;
};

export class GetCategoryChainUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(command: GetCategoryChainUseCaseCommand): Promise<CategoryDTO[]> {
    const categories = await this.categoryRepository.findChainById(command.id);

    return categories.map((category) => toCategoryDTO(category));
  }
}
