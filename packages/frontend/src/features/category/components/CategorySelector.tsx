import { BoxProps, Group } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Category as ApiCategory } from "@/utils/api-types";
import { readResponse, rpc } from "@/utils/client";

import CategorySelectorBase from "./CategorySelectorBase";

type Category = ApiCategory;

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

  const { data: categories } = useQuery({
    queryKey: ["get", "/categories"],
    queryFn: ({ signal }) =>
      rpc.api.categories
        .$get({}, { init: { signal: signal } })
        .then(readResponse),
  });
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
