import { BoxProps, Group } from "@mantine/core";
import CategorySelectorBase from "./CategorySelectorBase";
import { $api } from "@/utils/client";
import { useEffect, useState } from "react";

interface CategorySelectorProps extends BoxProps {
  value?: number,
  onChange?: (value: number | undefined) => void,
}

export default function CategorySelector({
  value,
  onChange = () => {},
  ...others
}: CategorySelectorProps) {
  const { data } = $api.useQuery('get', '/categories/{id}', {
    params: {
      path: {
        id: value || 0
      }
    }
  });

  useEffect(() => {
    if (data && data.length > 0) setCategory(data[0].id);
    if (data && data.length > 1) setSubCategory(data[1].id);
  }, [ data ])

  const [ category, setCategory ] = useState<number | undefined>();
  const [ subCategory, setSubCategory ] = useState<number | undefined>();

  const { data: categories } = $api.useQuery('get', '/categories');
  const subCategories = categories?.find(c => c.id == category)?.sub || [];

  return (
    <Group grow {...others}>
      <CategorySelectorBase 
        label="ジャンル"
        data={categories}
        value={category}
        onChange={(val) => {
          setCategory(val);
          val && onChange(val);
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
        onChange={(val) => {
          setSubCategory(val);
          val && onChange(val);
        }}
        onClear={() => { 
          setSubCategory(undefined);
          onChange(undefined);
        }}
      />
    </Group>
  )
}