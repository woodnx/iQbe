import { AddCategoryPresetUseCase } from "@/applications/usecases/Category/AddCategoryPresetUseCase.js";
import { CreateCategoryUseCase } from "@/applications/usecases/Category/CreateCategoryUseCase.js";
import { DeleteCategoryUseCase } from "@/applications/usecases/Category/DeleteCategoryUseCase.js";
import { GetCategoriesUseCase } from "@/applications/usecases/Category/GetCategoriesUseCase.js";
import { GetCategoryChainUseCase } from "@/applications/usecases/Category/GetCategoryChainUseCase.js";
import { GetCategoryPresetListUseCase } from "@/applications/usecases/Category/GetCategoryPresetListUseCase.js";
import { UpdateCategoryUseCase } from "@/applications/usecases/Category/UpdateCategoryUseCase.js";
import { ApiError } from "@/http/ApiError.js";
import type { ApiContext } from "@/http/context.js";
import {
  deleteCategoriesId,
  getCategories,
  getCategoriesId,
  getCategoriesPreset,
  postCategories,
  postCategoriesPreset,
  putCategoriesId,
} from "./schema.js";

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
    return async (c: ApiContext<typeof getCategories>) => {
      const categories = await this.getCategoriesUseCase.execute();

      return c.json(categories, 200);
    };
  }

  getFromId() {
    return async (c: ApiContext<typeof getCategoriesId>) => {
      const param = c.req.valid("param");
      const { id } = param;
      const parsedId = Number(id);

      if (!Number.isFinite(parsedId)) throw new ApiError().invalidParams();

      const categories = await this.getCategoryChainUseCase.execute({
        id: parsedId,
      });

      return c.json(categories, 200);
    };
  }

  post() {
    return async (c: ApiContext<typeof postCategories>) => {
      const body = c.req.valid("json");
      if (!c.get("user").isSuperUser) throw new ApiError().accessDenied();

      const { name, description, parentId, disabled } = body;

      if (!name) {
        throw new ApiError().invalidParams();
      }

      await this.createCategoryUseCase.execute({
        name,
        description: description || null,
        parentId: parentId || null,
        disabled,
      });

      return c.body(null, 201);
    };
  }

  put() {
    return async (c: ApiContext<typeof putCategoriesId>) => {
      const param = c.req.valid("param");
      const body = c.req.valid("json");
      if (!c.get("user").isSuperUser) throw new ApiError().accessDenied();

      const { id } = param;
      const { description, disabled } = body;

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

      return c.body(null, 200);
    };
  }

  delete() {
    return async (c: ApiContext<typeof deleteCategoriesId>) => {
      const param = c.req.valid("param");
      if (!c.get("user").isSuperUser) throw new ApiError().accessDenied();

      const { id } = param;

      if (!id) throw new ApiError().invalidParams();

      const parsedId = Number(id);

      if (!Number.isFinite(parsedId)) throw new ApiError().invalidParams();

      await this.deleteCategoryUseCase.execute({ id: parsedId });

      return c.body(null, 204);
    };
  }

  getPreset() {
    return async (c: ApiContext<typeof getCategoriesPreset>) => {
      return c.json(this.getCategoryPresetListUseCase.execute(), 200);
    };
  }

  addFromPreset() {
    return async (c: ApiContext<typeof postCategoriesPreset>) => {
      const body = c.req.valid("json");
      if (!c.get("user").isSuperUser) throw new ApiError().accessDenied();

      const preset = body.preset;

      if (!preset) {
        throw new ApiError().invalidParams();
      }

      await this.addCategoryPresetUseCase.execute({ preset });

      return c.body(null, 200);
    };
  }
}
