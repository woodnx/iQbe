import { components } from "api/schema";
import { useState } from "react";

import { $api } from "@/utils/client";
import { BoxProps, Group } from "@mantine/core";

import CategorySelectorBase from "./CategorySelectorBase";

type Category = components["schemas"]["Category"];

interface CategorySelectorProps extends BoxProps {
  value?: Category[];
  onChange?: (value: Category[] | undefined) => void;
  disabled?: boolean;
}

export default function CategorySelector({
  value,
  onChange = () => {},
  disabled,
  ...others
}: CategorySelectorProps) {
  const [category, setCategory] = useState<Category | undefined>(
    value && value.length > 0 ? value[0] : undefined,
  );
  const [subCategory, setSubCategory] = useState<Category | undefined>(
    value && value.length > 1 ? value[1] : undefined,
  );

  const { data: categories } = $api.useQuery("get", "/categories");
  const subCategories =
    categories?.find((c) => c.id == category?.id)?.sub || [];

  return (
    <Group grow {...others}>
      <CategorySelectorBase
        label="ジャンル"
        data={categories}
        value={category}
        disabled={disabled}
        onChange={(val) => {
          setCategory(val);
          val && onChange([val]);
        }}
        onClear={() => {
          setCategory(undefined);
          setSubCategory(undefined);
          onChange(undefined);
        }}
      />
      <CategorySelectorBase
        label="サブジャンル"
        placeholder="サブジャンルを選択"
        data={subCategories}
        value={subCategory}
        disabled={disabled}
        onChange={(val) => {
          setSubCategory(val);
          val && onChange([...(value || []), val]);
        }}
        onClear={() => {
          setSubCategory(undefined);
          onChange(undefined);
        }}
      />
    </Group>
  );
}
