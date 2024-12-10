import { BoxProps, Group } from "@mantine/core";
import { useCategories } from "@/hooks/useCategories";
import FilteringCategoriesBase from "./FilteringCategoriesBase";
import { useState } from "react";
import { components } from "api/schema";

type Category = components['schemas']['Category'];
type SubCategory = components['schemas']['SubCategory'];

interface FilteringCategoriesProps extends BoxProps {
  values?: number[],
  onChange?: (values: number[]) => void
}

export default function FilteringCategories({ 
  values = [], 
  onChange = () => {},
  ...others
}: FilteringCategoriesProps) {
  const { categories: data } = useCategories();
  const [ categories, setCategories ] = useState<Category[]>([]);
  const [ subCategories, setSubCategories ] = useState<SubCategory[]>([]);
  const [ showingSub, setShowingSub ] = useState<Category[]>([]);

  return (
    <Group grow {...others}>
      <FilteringCategoriesBase 
        data={data}
        values={categories}
        onChange={(value) => {
          setCategories(value);
          setShowingSub(value.reduce(
            (acc, category) => [ ...acc, ...category.sub || [] ], 
            [] as Category[]
          ));

          const subIds = value.reduce((acc, category) => [...acc, ...category.sub?.map(s => s.id) || []], [] as number[]);
          onChange(subIds);
        }}
        onRemove={(target) => {
          const subToNotRemove = subCategories.filter(s => !target.sub?.some(v => v.id == s.id));
          setSubCategories(subToNotRemove);
        }}
      />
      
      <FilteringCategoriesBase 
        data={showingSub}
        values={subCategories}
        onChange={(value) => {
          setSubCategories(value);
        }}
        onAdd={(target) => {
          const parent = data?.find(d => d.id == target.parentId);
          const subIds = parent?.sub?.map(s => s.id) || [];
          const fullParent = parent?.sub?.reduce((bool, s) => {
            if (!bool) return false;
            if (values.some(v => s.id == v)) return true;
            else return false;
          }, true);

          if (fullParent) {
            onChange([...new Set([...values.filter(v => !subIds.includes(v)), target.id ])]);
          }
        }}
        onRemove={(target) => {
          const parent = data?.find(d => d.id == target.parentId);
          const subIds = parent?.sub?.map(s => s.id) || [];

          const existSubId = parent?.sub?.reduce((bool, s) => {
            if (bool) return true;
            if (!values.some(v => s.id == v && target.id != v)) return false;
            else return true;
          }, false);

          if (existSubId) {
            onChange([...new Set([...values.filter(v => target.id != v)])]);
          }
          else {
            onChange([...new Set([...values.filter(v => target.id != v), ...values, ...subIds])]);
          }
        }}
      />
    </Group>
  )
}