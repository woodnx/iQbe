import { ApiError } from "api";
import ITransactionManager from "@/applications/shared/ITransactionManager";
import abc23 from "@/db/categories/abc23.json";
import minhaya from "@/db/categories/minhaya.json";
import Category from "@/domains/Category";
import ICategoryRepository from "@/domains/Category/ICategoryRepository";

type CategoryDAO = {
  name: string;
  description?: string | null;
  sub?: {
    name: string;
    description?: string | null;
  }[];
};

export type AddCategoryPresetUseCaseCommand = {
  preset: string;
};

const selectPreset = (preset: string): CategoryDAO[] | null => {
  switch (preset) {
    case "abc23":
      return abc23;
    case "minhaya":
      return minhaya;
    default:
      return null;
  }
};

export class AddCategoryPresetUseCase {
  constructor(
    private transactionManager: ITransactionManager,
    private categoryRepository: ICategoryRepository,
  ) {}

  async execute(command: AddCategoryPresetUseCaseCommand): Promise<void> {
    const categories = selectPreset(command.preset);

    if (!categories) throw new ApiError().invalidParams();

    await this.transactionManager.begin(async () => {
      const existingCategories = await this.categoryRepository.getAll();

      for (const presetCategory of categories) {
        const existing = existingCategories.filter(
          (category) => category.name === presetCategory.name,
        );

        const category =
          existing.length === 0
            ? Category.create(
                presetCategory.name,
                presetCategory.description || null,
                -1,
                false,
              )
            : existing[0];

        await this.categoryRepository.save(category);

        const id = await this.categoryRepository
          .findByName(presetCategory.name)
          .then((found) => found?.id);

        if (!id) throw new Error("Category not found");

        const subCategories = presetCategory.sub || [];
        for (const sub of subCategories) {
          const existingSub = existingCategories.filter(
            (category) => category.name === sub.name,
          );

          const subCategory =
            existingSub.length === 0
              ? Category.create(sub.name, sub.description || null, id, false)
              : existingSub[0];

          await this.categoryRepository.save(subCategory);
        }
      }
    });
  }
}
