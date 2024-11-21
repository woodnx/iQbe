import Category from "@/domains/Category";
import CategoryRepository from "@/domains/Category/ICategoryRepository";

export default class CategoryUseCase {
  constructor(
    private categoryRepository: CategoryRepository,
  ) {}

  async addCategory(name: string, description: string | null, parentId: number | null) {
    const category = Category.create(
      name,
      description,
      parentId || -1, // -1 means no parent
    );

    await this.categoryRepository.save(category);
  }
}
