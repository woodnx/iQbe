import { ApiError } from "api";

import { AddCategoryPresetUseCase } from "@/applications/usecases/AddCategoryPresetUseCase";
import { CreateCategoryUseCase } from "@/applications/usecases/CreateCategoryUseCase";
import { DeleteCategoryUseCase } from "@/applications/usecases/DeleteCategoryUseCase";
import { GetCategoriesUseCase } from "@/applications/usecases/GetCategoriesUseCase";
import { GetCategoryChainUseCase } from "@/applications/usecases/GetCategoryChainUseCase";
import { GetCategoryPresetListUseCase } from "@/applications/usecases/GetCategoryPresetListUseCase";
import { UpdateCategoryUseCase } from "@/applications/usecases/UpdateCategoryUseCase";
import { typedAsyncWrapper } from "@/utils";

export default class CategoryController {
  constructor(
    private getCategoriesUseCase: GetCategoriesUseCase,
    private getCategoryChainUseCase: GetCategoryChainUseCase,
    private createCategoryUseCase: CreateCategoryUseCase,
    private updateCategoryUseCase: UpdateCategoryUseCase,
    private deleteCategoryUseCase: DeleteCategoryUseCase,
    private getCategoryPresetListUseCase: GetCategoryPresetListUseCase,
    private addCategoryPresetUseCase: AddCategoryPresetUseCase,
  ) {}

  get() {
    return typedAsyncWrapper<"/categories", "get">(async (req, res) => {
      const categories = await this.getCategoriesUseCase.execute();

      res.status(200).send(categories);
    });
  }

  getFromId() {
    return typedAsyncWrapper<"/categories/{id}", "get">(async (req, res) => {
      const { id } = req.params;
      const parsedId = Number(id);

      if (!Number.isFinite(parsedId)) throw new ApiError().invalidParams();

      const categories = await this.getCategoryChainUseCase.execute({
        id: parsedId,
      });

      res.status(200).send(categories);
    });
  }

  post() {
    return typedAsyncWrapper<"/categories", "post">(async (req, res) => {
      if (!req.user.isSuperUser) throw new ApiError().accessDenied();

      const { name, description, parentId, disabled } = req.body;

      if (!name) {
        throw new ApiError().invalidParams();
      }

      await this.createCategoryUseCase.execute({
        name,
        description: description || null,
        parentId: parentId || null,
        disabled,
      });

      res.status(201).send();
    });
  }

  put() {
    return typedAsyncWrapper<"/categories/{id}", "put">(async (req, res) => {
      if (!req.user.isSuperUser) throw new ApiError().accessDenied();

      const { id } = req.params;
      const { description, disabled } = req.body;

      if (!id) {
        throw new ApiError().invalidParams();
      }

      const parsedId = Number(id);

      if (!Number.isFinite(parsedId)) throw new ApiError().invalidParams();

      await this.updateCategoryUseCase.execute({
        id: parsedId,
        description: description || null,
        disabled,
      });
    });
  }

  delete() {
    return typedAsyncWrapper<"/categories/{id}", "delete">(async (req, res) => {
      if (req.user.isSuperUser) throw new ApiError().accessDenied();

      const { id } = req.params;

      if (!id) throw new ApiError().invalidParams();

      const parsedId = Number(id);

      if (!Number.isFinite(parsedId)) throw new ApiError().invalidParams();

      await this.deleteCategoryUseCase.execute({ id: parsedId });
    });
  }

  getPreset() {
    return typedAsyncWrapper<"/categories/preset", "get">(async (req, res) => {
      res.send(this.getCategoryPresetListUseCase.execute());
    });
  }

  addFromPreset() {
    return typedAsyncWrapper<"/categories/preset", "post">(async (req, res) => {
      if (!req.user.isSuperUser) throw new ApiError().accessDenied();

      const preset = req.body.preset;

      if (!preset) {
        throw new ApiError().invalidParams();
      }

      await this.addCategoryPresetUseCase.execute({ preset });

      res.send();
    });
  }
}
