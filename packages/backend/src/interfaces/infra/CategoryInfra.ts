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

  async getAll(): Promise<Category[]> {
    const client = this.clientManager.getClient();
    const category = await client
    .selectFrom('categories')
    .selectAll()
    .execute();

    return category.map(c => new Category(
      c.id,
      c.name,
      c.description,
      c.parent_id,
      !!c.disabled ? true : false,
    ))
  }

  async available(): Promise<CategoryDTO[]> {
    const client = this.clientManager.getClient();

    const categories = await client
    .selectFrom('categories')
    .selectAll()
    .where((({ and, eb }) => and([
      eb('parent_id', '=', -1),
      eb('disabled', '=', 0),
    ])))
    .execute();

    const subCategories = await client
    .selectFrom('categories')
    .selectAll()
    .where('parent_id', '!=', -1)
    .where((({ and, eb }) => and([
      eb('parent_id', '!=', -1),
      eb('disabled', '=', 0),
    ])))
    .execute();

    return categories.map(category => {
      const sub = subCategories.filter(sub => sub.parent_id === category.id)
        .map(sub => ({ 
          id: sub.id, 
          name: sub.name, 
          description: sub.description,
          parentId: sub.parent_id,
          disabled: sub.disabled ? true : false,
      }));

      return {
        id: category.id, 
        name: category.name, 
        description: category.description,
        parentId: -1,
        disabled: category.disabled ? true : false,
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
          disabled: sub.disabled ? true : false,
      }));

      return {
        id: category.id, 
        name: category.name, 
        description: category.description,
        parentId: -1,
        disabled: category.disabled ? true : false,
        sub,
      }
    });
  }

  async findById(id: number): Promise<Category | undefined> {
    const client = this.clientManager.getClient();

    const category = await client
    .selectFrom('categories')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

    if (!category) return undefined;

    return new Category(
      category.id,
      category.name,
      category.description,
      category.parent_id
    );
  }

  async findByName(name: string): Promise<Category | undefined> {
    const client = this.clientManager.getClient();

    const category = await client
    .selectFrom('categories')
    .selectAll()
    .where('name', '=', name)
    .executeTakeFirst();

    if (!category) return undefined;

    return new Category(
      category.id,
      category.name,
      category.description,
      category.parent_id
    );
  }

  async findChainById(id: number): Promise<Category[]> {
    const client = this.clientManager.getClient();

    const category = await client
    .selectFrom('categories')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

    if (!category) return [];

    const chain: Category[] = [];
    chain.push(new Category(
      category.id,
      category.name,
      category.description,
      category.parent_id
    ));

    let parentId = category.parent_id;
    while (parentId !== -1) {
      const parent = await client
      .selectFrom('categories')
      .selectAll()
      .where('id', '=', parentId)
      .executeTakeFirst();

      if (!parent) break;

      chain.push(new Category(
        parent.id,
        parent.name,
        parent.description,
        parent.parent_id
      ));

      parentId = parent.parent_id;
    }

    return chain.reverse();
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
        disabled: category.disabled ? 1 : 0,
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
      disabled: category.disabled ? 1 : 0,
    })
    .execute();
  }

  async delete(category: Category): Promise<void> {
    const client = this.clientManager.getClient();
    
    await client.deleteFrom('categories')
    .where('id', '=', category.id)
    .execute();
  }
}
