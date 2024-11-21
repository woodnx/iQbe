import ICategoryQueryService, {
  CategoryDTO
} from '@/applications/queryservices/ICategoryQueryService';
import Category from '@/domains/Category';
import ICategoryRepository from '@/domains/Category/ICategoryRepository';

import KyselyClientManager from './kysely/KyselyClientManager';

export default class CategoryInfra implements ICategoryRepository, ICategoryQueryService {
  constructor(private clientManager: KyselyClientManager) {}

  private async existsCategory(name: string): Promise<boolean> {
    const client = this.clientManager.getClient();

    const category = await client
    .selectFrom('categories')
    .select('id')
    .where('name', '=', name)
    .executeTakeFirst();

    return category !== undefined;
  }

  async available(): Promise<CategoryDTO[]> {
    const client = this.clientManager.getClient();

    const categories = await client
    .selectFrom('categories')
    .selectAll()
    .where('parent_id', '=', -1)
    .execute();

    const subCategories = await client
    .selectFrom('categories')
    .selectAll()
    .where('parent_id', '!=', -1)
    .execute();

    return categories.map(category => {
      const sub = subCategories.filter(sub => sub.parent_id === category.id)
        .map(sub => ({ 
          id: sub.id, 
          name: sub.name, 
          description: sub.description,
          parentId: sub.parent_id,
      }));

      return {
        id: category.id, 
        name: category.name, 
        description: category.description,
        sub,
      }
    });
  }

  async all(): Promise<CategoryDTO[]> {
    const client = this.clientManager.getClient();

    const categories = await client
    .selectFrom('categories')
    .selectAll()
    .where('parent_id', '=', -1)
    .execute();

    const subCategories = await client
    .selectFrom('categories')
    .selectAll()
    .where('parent_id', '!=', -1)
    .execute();

    return categories.map(category => {
      const sub = subCategories.filter(sub => sub.parent_id === category.id)
        .map(sub => ({ 
          id: sub.id, 
          name: sub.name, 
          description: sub.description,
          parentId: sub.parent_id,
      }));

      return {
        id: category.id, 
        name: category.name, 
        description: category.description,
        sub,
      }
    });
  }

  async save(category: Category): Promise<void> {
    const client = this.clientManager.getClient();

    const exists = await this.existsCategory(category.name);

    if (exists) {
      await client
      .updateTable('categories')
      .set({
        name: category.name,
        description: category.description,
        parent_id: category.parentId,
      })
      .where('id', '=', category.id)
      .execute();

      return;
    }

    await client
    .insertInto('categories')
    .values({
      name: category.name,
      description: category.description,
      parent_id: category.parentId,
    })
    .execute();
  }
}
