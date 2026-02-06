import preset from "@/db/categories/preset.json";

export type CategoryPresetItem = {
  name: string;
  value: string;
  description: string;
  tag?: string;
};

export class GetCategoryPresetListUseCase {
  execute(): CategoryPresetItem[] {
    return preset;
  }
}
