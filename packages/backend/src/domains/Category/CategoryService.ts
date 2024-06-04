import SubCategoryRepository from "../SubCategory/SubCategoryRepository";
import CategoryRepository from "./CategoryRepository";

export default class CategoryService {
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
}
