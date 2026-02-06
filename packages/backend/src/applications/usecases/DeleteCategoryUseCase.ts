import ICategoryRepository from "@/domains/Category/ICategoryRepository";

export type DeleteCategoryUseCaseCommand = {
  id: number;
};

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(command: DeleteCategoryUseCaseCommand): Promise<void> {
    const category = await this.categoryRepository.findById(command.id);

    if (!category) throw new Error("Category not found");

    await this.categoryRepository.delete(category);
  }
}
