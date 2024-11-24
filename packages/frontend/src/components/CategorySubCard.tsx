import { ActionIcon, BoxProps, Group } from "@mantine/core";
import CategoryBaseCard from "./CategoryBaseCard";
import { IconPencil } from "@tabler/icons-react";
import { modals } from "@mantine/modals";

export interface CategorySubCardProps extends BoxProps {
  id: number,
  name: string,
  description?: string,
  disabled: boolean,
  parentId: number,
  parentName: string,
}

export default function CategorySubCard({
  id,
  name,
  description,
  parentId,
  disabled,
  parentName,
  ...others
}: CategorySubCardProps) {
  const modal = () => modals.openContextModal({
    modal: 'categoryEdit',
    title: `${parentName}ジャンルのサブジャンル「${name}」を編集`,
    innerProps: {
      id,
      name,
      disabled,
      description,
      isSub: true,
      parentId,
    },
    size: 'lg',
    zIndex: 200,
  });

  return (
    <Group justify="space-between" wrap="nowrap" {...others}>
      <CategoryBaseCard 
        ml="xl"
        name={name}
        description={description}
        disabled={disabled}
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