import CategoryService from "@/domains/Category/CategoryService";
import CategoryInfra from "@/infra/CategoryInfra";
import SubCategoryInfra from "@/infra/SubCategoryInfra";
import KyselyClientManager from "@/infra/kysely/KyselyClientManager";
import { typedAsyncWrapper } from "@/utils";

export const get = typedAsyncWrapper<"/categories", "get">(async (req, res) => {
  const categoryService = new CategoryService(
    new CategoryInfra(new KyselyClientManager()), 
    new SubCategoryInfra(new KyselyClientManager())
  );

  const categories = await categoryService.findAllWithSub();

  if (!categories) {
    throw new Error('');
  }

  const data = categories.map(category => ({
    id: category.category.id,
    name: category.category.name,
    description: category.category.description,
    sub: category.sub?.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      parentId: s.parentId,
    })),
  }));

  res.status(200).send(data);
});

export const getSub = typedAsyncWrapper<"/categories/sub", "get">(async (req, res) => {
  const subCategoryRepository = new SubCategoryInfra(new KyselyClientManager());
  const subCategories = await subCategoryRepository.findAll();

  const data = subCategories?.map(sub => ({
    id: sub.id,
    name: sub.name,
    description: sub.description,
    parentId: sub.parentId,
  }));

  res.status(200).send(data);
});

export default {
  get,
  getSub,
}
