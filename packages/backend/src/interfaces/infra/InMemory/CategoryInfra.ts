import ICategoryQueryService, {
  CategoryDTO,
} from "@/applications/queryservices/ICategoryQueryService";
import Category from "@/domains/Category";
import ICategoryRepository from "@/domains/Category/ICategoryRepository";

export class InMemoryCategoryInfra
  implements ICategoryRepository, ICategoryQueryService
{
  private categories: Category[] = [];
  private nextId = 1;

  async getAll(): Promise<Category[]> {
    return [...this.categories];
  }

  async available(): Promise<CategoryDTO[]> {
    return this.buildCategoryTree({ includeDisabled: false });
  }

  async all(): Promise<CategoryDTO[]> {
    return this.buildCategoryTree({ includeDisabled: true });
  }

  async findById(id: number): Promise<Category | undefined> {
    return this.categories.find((category) => category.id === id);
  }

  async findByName(name: string): Promise<Category | undefined> {
    return this.categories.find((category) => category.name === name);
  }

  async findChainById(id: number): Promise<Category[]> {
    const category = await this.findById(id);

    if (!category) return [];

    const chain: Category[] = [category];
    let parentId = category.parentId;

    while (parentId !== -1) {
      const parent = await this.findById(parentId);
      if (!parent) break;

      chain.push(parent);
      parentId = parent.parentId;
    }

    return chain.reverse();
  }

  async save(category: Category): Promise<void> {
    let id: number | null = null;

    try {
      id = category.id;
    } catch {
      id = null;
    }

    if (id == null) {
      const newId = this.nextId++;
      const stored = new Category(
        newId,
        category.name,
        category.description,
        category.parentId,
        category.disabled,
      );
      this.categories.push(stored);
      return;
    }

    const index = this.categories.findIndex((item) => item.id === id);
    const stored = new Category(
      id,
      category.name,
      category.description,
      category.parentId,
      category.disabled,
    );

    if (index >= 0) {
      this.categories[index] = stored;
    } else {
      this.categories.push(stored);
    }
  }

  async delete(category: Category): Promise<void> {
    this.categories = this.categories.filter((item) => item.id !== category.id);
  }

  private async buildCategoryTree(options: { includeDisabled: boolean }) {
    const parents = this.categories.filter((category) => {
      if (category.parentId !== -1) return false;
      if (options.includeDisabled) return true;
      return !category.disabled;
    });

    const subs = this.categories.filter((category) => {
      if (category.parentId === -1) return false;
      if (options.includeDisabled) return true;
      return !category.disabled;
    });

    return parents.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description ?? null,
      disabled: category.disabled,
      parentId: category.parentId,
      sub: subs
        .filter((sub) => sub.parentId === category.id)
        .map((sub) => ({
          id: sub.id,
          name: sub.name,
          description: sub.description ?? null,
          parentId: sub.parentId,
          disabled: sub.disabled,
        })),
    }));
  }
}
