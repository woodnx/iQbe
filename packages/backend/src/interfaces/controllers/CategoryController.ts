import { ApiError } from 'api';

import ICategoryQueryService from '@/applications/queryservices/ICategoryQueryService';
import CategoryUseCase from '@/applications/usecases/CategoryUseCase';
import preset from '@/db/categories/preset.json';
import abc23 from '@/db/categories/abc23.json';
import minhaya from '@/db/categories/minhaya.json';
import { typedAsyncWrapper } from '@/utils';

export default class CategoryController {
  constructor(
    private categoryQueryService: ICategoryQueryService,
    private categoryUseCase: CategoryUseCase,
  ) {}

  private selectPreset(preset: string) {
    switch (preset) {
      case 'abc23':
        return abc23;
      case 'minhaya':
        return minhaya;
      default:
        return null;
    }
  }

  get() {
    return typedAsyncWrapper<"/categories", "get">(async (req, res) => {
      const categories = await this.categoryQueryService.all();
    
      if (!categories) {
        throw new Error('');
      }
    
      const data = categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        disabled: category.disabled,
        parentId: category.parentId,
        sub: category.sub?.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          parentId: s.parentId,
          disabled: s.disabled,
        })),
      }));
    
      res.status(200).send(data);
    })
  }

  post() {
    return typedAsyncWrapper<"/categories", "post">(async (req, res) => {
      const { name, description, parentId, disabled } = req.body;
  
      if (!name) {
        throw new ApiError().invalidParams();
      }
    
      await this.categoryUseCase.addCategory(name, description || null, parentId || null, disabled);
    
      res.status(201).send();
    })
  }

  put() {
    return typedAsyncWrapper<"/categories/{id}", "put">(async (req, res) => {
      const { id } = req.params;
      const { description, disabled } = req.body;

      if (!id) {
        throw new ApiError().invalidParams();
      }

      await this.categoryUseCase.editCategory(Number(id), description || null, disabled);
    });
  }

  delete() {
    return typedAsyncWrapper<"/categories/{id}", "delete">(async (req, res) => {
      const { id } = req.params;

      if (!id) throw new ApiError().invalidParams();

      await this.categoryUseCase.deleteCategory(id);
    })
  }

  getPreset() {
    return typedAsyncWrapper<"/categories/preset", "get">(async (req, res) => {
      res.send(preset);
    });
  }

  addFromPreset() {
    return typedAsyncWrapper<"/categories/preset", "post">(async (req, res) => {
      const preset = req.body.preset;

      if (!preset) {
        throw new ApiError().invalidParams();
      }

      const categories = this.selectPreset(preset);

      if (!categories) {
        throw new ApiError().invalidParams();
      }

      await this.categoryUseCase.addPresetCategory(categories);

      res.send();
    });
  }
}
