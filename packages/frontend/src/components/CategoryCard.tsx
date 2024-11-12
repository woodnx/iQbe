import { ActionIcon, BoxProps, Card, Collapse, Divider, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconChevronUp, IconPencil } from "@tabler/icons-react";
import CategoryBaseCard from "./CategoryBaseCard";
import CategoryCreateModalButton from "./CategoryCreateModalButton";
import { modals } from "@mantine/modals";
import CategorySubCard from "./CategorySubCard";

interface CategoryCardProps extends BoxProps {
  id: number,
  name: string,
  description?: string,
  sub?: {
    id: number,
    name: string,
    description?: string | null
  }[],
}

export default function CategoryCard({
  id,
  name,
  description,
  sub,
  ...other
}: CategoryCardProps) {
  const [ opened, { toggle } ] = useDisclosure(false);
  const IconChevron = () => opened ? <IconChevronUp /> : <IconChevronDown />;

  const modal = () => modals.openContextModal({
    modal: 'categoryEdit',
    title: `${name}ジャンルを編集`,
    innerProps: {
      id,
      name,
      description,
      isSub: false,
      parentId: undefined,
    },
    size: 'lg',
    zIndex: 200
  });

  return (
    <Card withBorder {...other}>
      <Group justify="space-between" wrap="nowrap">
        <CategoryBaseCard 
          name={name}
          description={description}
        />
        <div>
          <ActionIcon mr="lg" variant="transparent" color="gray">
            <IconPencil onClick={modal} />
          </ActionIcon>
          <ActionIcon onClick={toggle} variant="transparent" color="gray">
            <IconChevron />
          </ActionIcon>
        </div>
      </Group>
      <Collapse in={opened}>
        <Divider mt="md"/>
        {
          sub?.map((s) =>
            <CategorySubCard 
              key={s.id}
              id={s.id}
              name={s.name}
              description={s.description || undefined}
              parentId={id}
              parentName={name}
              mt="sm"
            /> 
          )
        }
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
  )
}