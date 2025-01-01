import { ActionIcon, Menu, rem } from '@mantine/core';

import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';

interface CategoryEditMenuProps {
  onEdit?: () => void,
  onDelete?: () => void,
}

const CategoryEditMenu = ({
  onEdit = () => {},
  onDelete = () => {},
}: CategoryEditMenuProps) => {

  return (
    <Menu>
      <Menu.Target>
        <ActionIcon variant="transparent" color="gray">
          <IconDots />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item 
          onClick={onEdit}
          leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }} />}
        >
          編集
        </Menu.Item>
        <Menu.Item 
          onClick={onDelete}
          leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
        >
          削除
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default CategoryEditMenu;