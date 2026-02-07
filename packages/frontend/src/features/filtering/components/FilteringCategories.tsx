import { BoxProps, Group, Text } from "@mantine/core";
import { useCategories } from "@/hooks/useCategories";
import FilteringCategoriesBase from "./FilteringCategoriesBase";
import { useState } from "react";
import { components } from "api/schema";

type Category = components["schemas"]["Category"];
type SubCategory = components["schemas"]["SubCategory"];

interface FilteringCategoriesProps extends BoxProps {
  value?: number[];
  onChange?: (value: number[]) => void;
}

export default function FilteringCategories({
  value = [],
  onChange = () => {},
  ...others
}: FilteringCategoriesProps) {
  const { categories: data } = useCategories();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [showingSub, setShowingSub] = useState<Category[]>([]);

  return (
    <>
      <Text fz="sm">ジャンルの絞り込み</Text>
      <Group grow {...others}>
        <FilteringCategoriesBase
          data={data}
          values={categories}
          label="大ジャンル"
          placeholder="大ジャンルを選択"
          onChange={(value) => {
            setCategories(value);
            setShowingSub(
              value.reduce(
                (acc, category) => [...acc, ...(category.sub || [])],
                [] as Category[],
              ),
            );

            const subIds = value.reduce(
              (acc, category) => [
                ...acc,
                ...(category.sub?.map((s) => s.id) || []),
              ],
              [] as number[],
            );
            onChange(subIds);
          }}
          onRemove={(target) => {
            const subToNotRemove = subCategories.filter(
              (s) => !target.sub?.some((v) => v.id == s.id),
            );
            setSubCategories(subToNotRemove);
          }}
        />

        <FilteringCategoriesBase
          data={showingSub}
          values={subCategories}
          label="小ジャンル"
          placeholder="小ジャンルを選択"
          onChange={(value) => {
            setSubCategories(value);
          }}
          onAdd={(target) => {
            const parent = data?.find((d) => d.id == target.parentId);
            const subIds = parent?.sub?.map((s) => s.id) || [];
            const fullParent = parent?.sub?.reduce((bool, s) => {
              if (!bool) return false;
              if (value.some((v) => s.id == v)) return true;
              else return false;
            }, true);

            if (fullParent) {
              onChange([
                ...new Set([
                  ...value.filter((v) => !subIds.includes(v)),
                  target.id,
                ]),
              ]);
            }
          }}
          onRemove={(target) => {
            const parent = data?.find((d) => d.id == target.parentId);
            const subIds = parent?.sub?.map((s) => s.id) || [];

            const existSubId = parent?.sub?.reduce((bool, s) => {
              if (bool) return true;
              if (!value.some((v) => s.id == v && target.id != v)) return false;
              else return true;
            }, false);

            if (existSubId) {
              onChange([...new Set([...value.filter((v) => target.id != v)])]);
            } else {
              onChange([
                ...new Set([
                  ...value.filter((v) => target.id != v),
                  ...value,
                  ...subIds,
                ]),
              ]);
            }
          }}
        />
      </Group>
    </>
  );
}
