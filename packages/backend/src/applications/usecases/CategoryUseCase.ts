import Category from "@/domains/Category";
import CategoryRepository from "@/domains/Category/ICategoryRepository";
import ITransactionManager from "../shared/ITransactionManager";

type CategoryDAO = {
  name: string,
  description?: string | null,
  sub?: {
    name: string,
    description?: string | null,
  }[]
}

export default class CategoryUseCase {
  constructor(
    private transactionManager: ITransactionManager,
    private categoryRepository: CategoryRepository,
  ) {}

  async addCategory(name: string, description: string | null, parentId: number | null, disabled: boolean) {
    const category = Category.create(
      name,
      description,
      parentId || -1, // -1 means no parent,
      disabled,
    );

    await this.categoryRepository.save(category);
  }

  async addPresetCategory(presetCategories: CategoryDAO[]) {
    await this.transactionManager.begin(async () => {
      const existingCategories = await this.categoryRepository.getAll();

      for (const presetCategory of presetCategories) {
        const _category = existingCategories
          .filter(c => c.name === presetCategory.name);
        
        const category = (_category.length == 0)
        ? Category.create(
          presetCategory.name,
          presetCategory.description || null,
          -1, // -1 means no parent
          false,
        )
        : _category[0];
  
        await this.categoryRepository.save(category);

        const id = await this.categoryRepository
        .findByName(presetCategory.name)
        .then((category) => category?.id);

        if (!id) 
          throw new Error('Category not found');

        const subCategories = presetCategory.sub || [];
        for (const sub of subCategories) {
          const _subCategory = existingCategories
            .filter(c => c.name === sub.name);

          const subCategory = (_subCategory.length == 0) 
          ? Category.create(
            sub.name,
            sub.description || null,
            id,
            false,
          )
          : _subCategory[0];
          
          await this.categoryRepository.save(subCategory);
        }
      }
    });
  }

  async editCategory(id: number, description: string | null, disabled: boolean) {
    const category = await this.categoryRepository.findById(id);

    if (!category) throw new Error('Category not found');

    category.editDescription(description);
    disabled && category.disable();

    await this.categoryRepository.save(category);
  }

  async deleteCategory(id: number) {
    const category = await this.categoryRepository.findById(id);

    if (!category) 
      throw new Error('Category not found');
    
    this.categoryRepository.delete(category);
  }
}
