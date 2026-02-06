import ICategoryRepository from "@/domains/Category/ICategoryRepository";

export type UpdateCategoryUseCaseCommand = {
  id: number;
  description: string | null;
  disabled: boolean;
};

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(command: UpdateCategoryUseCaseCommand): Promise<void> {
    const category = await this.categoryRepository.findById(command.id);

    if (!category) throw new Error("Category not found");

    category.editDescription(command.description);
    if (command.disabled) category.disable();

    await this.categoryRepository.save(category);
  }
}
