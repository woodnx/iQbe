import { useIsMobile } from "@/contexts/isMobile";
import { ActionIcon, Button, ButtonProps } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconNewSection, IconPlus } from "@tabler/icons-react";

export interface CategoryAddModalButtonProps<T extends boolean> extends ButtonProps  {
  isSub: T,
  parentId: T extends true ? number : undefined,
  parentName: T extends true ? string : undefined,
  value?: string,
}

export default function CategoryCreateModalButton<T extends boolean>({
  isSub,
  parentId,
  parentName,
  value = 'ジャンルの新規作成',
  ...others
}: CategoryAddModalButtonProps<T>) {
  const isMobile = useIsMobile();
  const title = isSub 
    ? `${parentName}ジャンルのサブジャンルの追加`
    : 'ジャンルの追加';
  const modal = () => modals.openContextModal({
    modal: 'categoryCreate',
    title,
    innerProps: {
      name: '',
      description: '',
      isSub,
      parentId,
    },
    size: 'lg',
    zIndex: 200,
  });

  const DefaultButton = () => (
    <Button
      leftSection={<IconPlus />}
      onClick={modal}
      {...others}
    >{ value }</Button>
  );

  const MobileButton = () => (
    <ActionIcon
      onClick={modal}
    >
      <IconNewSection />
    </ActionIcon>
  );

  const ShowButton = () => (
    isMobile ? <MobileButton /> : <DefaultButton />   
  );

  return (
    <ShowButton />
  )
}