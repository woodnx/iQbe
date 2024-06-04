import Category from "@/domains/Category";
import CategoryRepository from "@/domains/Category/CategoryRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";

export default class CategoryInfra implements CategoryRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async findAll(): Promise<Category[] | undefined> {
    const client = this.clientManager.getClient();

    const categories = await client
    .selectFrom('categories')
    .selectAll()
    .execute();

    return categories.map(category => {
      return new Category(category.id, category.name, category.description)
    });
  }
}
