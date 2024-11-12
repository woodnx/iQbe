import Category from "@/domains/Category";
import CategoryRepository from "@/domains/Category/CategoryRepository";
import SubCategory from "@/domains/SubCategory";
import SubCategoryRepository from "@/domains/SubCategory/SubCategoryRepository";

export default class CategoryUseCase {
  constructor(
    private categoryRepository: CategoryRepository,
    private subCategoryRepository: SubCategoryRepository,
  ) {}

  async findAllWithSub() {
    const [ categories, sub ] = await Promise.all([
      this.categoryRepository.findAll(),
      this.subCategoryRepository.findAll(),
    ]);

    return categories?.map(category => ({
      category,
      sub: sub?.filter(s => s.parentId === category.id),
    }));
  }

  async findSub() {
    return this.subCategoryRepository.findAll();
  }

  async addCategory(name: string, description: string | null) {
    const category = Category.create(
      name,
      description,
    );

    await this.categoryRepository.save(category);
  }

  async addSubCategory(name: string, parentId: number, description: string | null) {
    const subCategory = SubCategory.create(
      name,
      description,
      parentId,
    );

    await this.subCategoryRepository.save(subCategory);
  }
}