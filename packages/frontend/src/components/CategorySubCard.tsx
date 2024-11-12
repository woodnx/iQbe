import { ActionIcon, BoxProps, Group } from "@mantine/core";
import CategoryBaseCard from "./CategoryBaseCard";
import { IconPencil } from "@tabler/icons-react";
import { modals } from "@mantine/modals";

export interface CategorySubCardProps extends BoxProps {
  id: number,
  name: string,
  description?: string,
  parentId: number,
  parentName: string,
}

export default function CategorySubCard({
  id,
  name,
  description,
  parentId,
  parentName,
  ...others
}: CategorySubCardProps) {
  const modal = () => modals.openContextModal({
    modal: 'categoryEdit',
    title: `${parentName}ジャンルのサブジャンル「${name}」を編集`,
    innerProps: {
      id,
      name,
      description,
      isSub: true,
      parentId,
    },
    size: 'lg',
    zIndex: 200,
  });

  return (
    <Group justify="space-between" {...others}>
      <CategoryBaseCard 
        ml="xl"
        name={name}
        description={description}
      />
      <ActionIcon
        variant="transparent" 
        color="gray"
        onClick={modal}
      >
        <IconPencil />
      </ActionIcon>
    </Group>
  );
} 