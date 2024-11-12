import { Group, Title } from "@mantine/core";
import CategoryCreateModalButton from "./CategoryCreateModalButton";
import CategoryCard from "./CategoryCard";
import { useCategories } from "@/hooks/useCategories";

export interface CategoryInputProps {
  
}

export default function CategoryInput({}: CategoryInputProps) {
  const { categories } = useCategories();

  const content = categories?.map(category => (
    <CategoryCard
      mt="md"
      id={category.id}
      name={category.name}
      description={category.description || ''}
      sub={category.sub || []}
      key={category.id}
    />
  ));

  return (
    <>
      <Group justify="space-between">
        <Title order={3} my="md">ジャンルの編集</Title>
        <CategoryCreateModalButton 
          isSub={false}
          parentId={undefined}
          parentName={undefined}
        />
      </Group>
      { content }
    </>
  );
}