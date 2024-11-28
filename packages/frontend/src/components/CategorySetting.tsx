import { Center, Group, Title } from "@mantine/core";
import CategoryCreateModalButton from "./CategoryCreateModalButton";
import CategoryCard from "./CategoryCard";
import { useCategories } from "@/hooks/useCategories";
import CategoryPresetButton from "./CategoryPresetButton";

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
      disabled={category.disabled}
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
      <Center mt="md">
        <CategoryPresetButton 
          size="lg" 
          radius="xl"
          color="green"
        />
      </Center>
    </>
  );
}