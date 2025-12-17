import {
  ActionIcon,
  BoxProps,
  Card,
  Collapse,
  Divider,
  Group,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import CategoryBaseCard from "./CategoryBaseCard";
import CategoryCreateModalButton from "./CategoryCreateModalButton";
import { modals } from "@mantine/modals";
import CategorySubCard from "./CategorySubCard";
import CategoryEditMenu from "./CategoryEditMenu";

interface CategoryCardProps extends BoxProps {
  id: number;
  name: string;
  description?: string;
  disabled: boolean;
  sub?: {
    id: number;
    name: string;
    description?: string | null;
    disabled: boolean;
  }[];
}

export default function CategoryCard({
  id,
  name,
  description,
  disabled,
  sub,
  ...other
}: CategoryCardProps) {
  const [opened, { toggle }] = useDisclosure(false);
  const IconChevron = () => (opened ? <IconChevronUp /> : <IconChevronDown />);

  const editModal = () =>
    modals.openContextModal({
      modal: "categoryEdit",
      title: `${name}ジャンルを編集`,
      innerProps: {
        id,
        name,
        description,
        disabled,
        isSub: false,
        parentId: undefined,
      },
      size: "lg",
      zIndex: 200,
    });

  const deleteModal = () =>
    modals.openContextModal({
      modal: "categoryDelete",
      title: `${name}ジャンルを削除`,
      innerProps: {
        id,
        isSub: false,
        parentId: undefined,
      },
      size: "lg",
      zIndex: 200,
    });

  return (
    <Card withBorder {...other}>
      <Group justify="space-between" wrap="nowrap">
        <CategoryBaseCard
          name={name}
          description={description}
          disabled={disabled}
        />
        <Group wrap="nowrap">
          <CategoryEditMenu onEdit={editModal} onDelete={deleteModal} />
          <ActionIcon onClick={toggle} variant="transparent" color="gray">
            <IconChevron />
          </ActionIcon>
        </Group>
      </Group>
      <Collapse in={opened}>
        <Divider mt="md" />
        {sub?.map((s) => (
          <CategorySubCard
            key={s.id}
            id={s.id}
            name={s.name}
            description={s.description || undefined}
            parentId={id}
            parentName={name}
            disabled={s.disabled}
            mt="sm"
          />
        ))}
        <Group justify="flex-end">
          <CategoryCreateModalButton
            mt="md"
            size="xs"
            value="サブジャンルの新規追加"
            isSub={true}
            parentId={id}
            parentName={name}
          />
        </Group>
      </Collapse>
    </Card>
  );
}
