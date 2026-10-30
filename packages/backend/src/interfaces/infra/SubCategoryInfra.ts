import SubCategory from "@/domains/SubCategory/index.js";
import SubCategoryRepository from "@/domains/SubCategory/SubCategoryRepository.js";
import KyselyClientManager from "./kysely/KyselyClientManager.js";

export default class SubCategoryInfra implements SubCategoryRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async findAll(): Promise<SubCategory[] | undefined> {
    const client = this.clientManager.getClient();

    const sub = await client
      .selectFrom("sub_categories")
      .select(["id", "name", "description", "parent_id as parentId"])
      .execute();

    return sub.map(
      (s) => new SubCategory(s.id, s.name, s.description, s.parentId),
    );
  }

  async save(subCategory: SubCategory): Promise<void> {
    const client = this.clientManager.getClient();

    await client
      .insertInto("sub_categories")
      .values({
        name: subCategory.name,
        description: subCategory.description,
        parent_id: subCategory.parentId,
      })
      .execute();
  }
}
