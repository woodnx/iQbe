import type { CategoryDTO as ApiCategoryDTO } from "@/types/dto.js";

import ICategoryRepository from "@/domains/Category/ICategoryRepository.js";

import { toCategoryDTO } from "./CategoryMapper.js";

type CategoryDTO = ApiCategoryDTO;

export type GetCategoryChainUseCaseCommand = {
  id: number;
};

export class GetCategoryChainUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(
    command: GetCategoryChainUseCaseCommand,
  ): Promise<CategoryDTO[]> {
    const categories = await this.categoryRepository.findChainById(command.id);

    return categories.map((category) => toCategoryDTO(category));
  }
}
