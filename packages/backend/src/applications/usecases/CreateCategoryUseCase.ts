import Category from "@/domains/Category";
import ICategoryRepository from "@/domains/Category/ICategoryRepository";

export type CreateCategoryUseCaseCommand = {
  name: string;
  description: string | null;
  parentId: number | null;
  disabled: boolean;
};

export class CreateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(command: CreateCategoryUseCaseCommand): Promise<void> {
    const category = Category.create(
      command.name,
      command.description,
      command.parentId ?? -1,
      command.disabled,
    );

    await this.categoryRepository.save(category);
  }
}
