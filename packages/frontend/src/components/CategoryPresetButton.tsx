import { Button, ButtonProps, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import CategoryPresetModal from './CategoryPresetModal';
import { $api } from '@/utils/client';
import { useQueryClient } from '@tanstack/react-query';

interface CategoryPresetButtonProps extends ButtonProps {

}

const CategoryPresetButton = ({
  ...others
}: CategoryPresetButtonProps) => {
  const [ opened, { close, open }] = useDisclosure();

  const queryClient = useQueryClient();
  const queryKey = ["get", "/categories", undefined];
  const { mutate } = $api.useMutation('post', '/categories/preset', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const addPreset = (preset: string) => {
    close();
    mutate({
      body: {
        preset,
      }
    })
  }

  return (
    <>
      <Modal 
        title="ジャンルの一括追加"
        opened={opened} 
        onClose={close}
      > 
        <CategoryPresetModal 
          onSave={addPreset}
        />
      </Modal>
      <Button 
        {...others}
        onClick={open}
      >
        プリセットから一括追加
      </Button>
    </>
  );
}

export default CategoryPresetButton;