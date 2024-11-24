import ICategoryQueryService from '@/applications/queryservices/ICategoryQueryService';
import CategoryUseCase from '@/applications/usecases/CategoryUseCase';
import { typedAsyncWrapper } from '@/utils';
import { ApiError } from 'api';

export default class CategoryController {
  constructor(
    private categoryQueryService: ICategoryQueryService,
    private categoryUseCase: CategoryUseCase,
  ) {}

  get() {
    return typedAsyncWrapper<"/categories", "get">(async (req, res) => {
      const categories = await this.categoryQueryService.available();
    
      if (!categories) {
        throw new Error('');
      }
    
      const data = categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
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

  post() {
    return typedAsyncWrapper<"/categories", "post">(async (req, res) => {
      const { name, description, parentId } = req.body;
  
      if (!name) {
        throw new ApiError().invalidParams();
      }
    
      await this.categoryUseCase.addCategory(name, description || null, parentId || null);
    
      res.status(201).send();
    })
  }

  put() {
    return typedAsyncWrapper<"/categories/{id}", "put">(async (req, res) => {
      const { id } = req.params;
      const { description } = req.body;

      if (!id) {
        throw new ApiError().invalidParams();
      }

      await this.categoryUseCase.editCategory(Number(id), description || null);
    });
  }
}
