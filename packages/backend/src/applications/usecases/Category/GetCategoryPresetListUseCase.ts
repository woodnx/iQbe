import preset from "@/db/categories/preset.json" with { type: "json" };

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
