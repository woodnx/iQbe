import CategoryUseCase from '@/applications/usecases/CategoryUseCase';
import { typedAsyncWrapper } from '@/utils';

export default class CategoryController {
  constructor(
    private categoryUseCase: CategoryUseCase,
  ) {}

  get() {
    return typedAsyncWrapper<"/categories", "get">(async (req, res) => {
      const categories = await this.categoryUseCase.findAllWithSub();
    
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
      const subCategories = await this.categoryUseCase.findSub();
    
      const data = subCategories?.map(sub => ({
        id: sub.id,
        name: sub.name,
        description: sub.description,
        parentId: sub.parentId,
      }));
    
      res.status(200).send(data);
    });
  }

  post() {
    return typedAsyncWrapper<"/categories", "post">(async (req, res) => {
      const { name, description } = req.body;
    
      await this.categoryUseCase.addCategory(name, description || null);
    
      res.status(201).send();
    });
  }

  postSub() {
    return typedAsyncWrapper<"/categories/sub", "post">(async (req, res) => {
      const { name, description, parentId } = req.body;
    
      await this.categoryUseCase.addSubCategory(name, parentId, description || null);
    
      res.status(201).send();
    });
  }
}
