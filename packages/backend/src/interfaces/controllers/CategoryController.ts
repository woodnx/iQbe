import CategoryService from '@/domains/Category/CategoryService';
import SubCategoryRepository from '@/domains/SubCategory/SubCategoryRepository';
import { typedAsyncWrapper } from '@/utils';

export default class CategoryController {
  constructor(
    private categoryService: CategoryService,
    private subCategoryRepository: SubCategoryRepository,
  ) {}

  get() {
    return typedAsyncWrapper<"/categories", "get">(async (req, res) => {
      const categories = await this.categoryService.findAllWithSub();
    
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
    })
  }

  getSub() {
    return typedAsyncWrapper<"/categories/sub", "get">(async (req, res) => {
      const subCategories = await this.subCategoryRepository.findAll();
    
      const data = subCategories?.map(sub => ({
        id: sub.id,
        name: sub.name,
        description: sub.description,
        parentId: sub.parentId,
      }));
    
      res.status(200).send(data);
    });
  }
}
