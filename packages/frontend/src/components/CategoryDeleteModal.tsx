import { components } from 'api/schema';

import { $api } from '@/utils/client';
import { Button, Group, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconTrash } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';

type Category = components['schemas']['Category'];

export interface CategoryCreateModalInnerProps<T extends boolean> {
  id: number,
  isSub: T,
  parentId: T extends true ? number : undefined,
}

const CategoryDeleteModal = <T extends boolean>({
  context,
  id: modalId,
  innerProps,
}: ContextModalProps<CategoryCreateModalInnerProps<T>>) => {
  const { id, ...formProps } = innerProps;
  const queryClient = useQueryClient();
  const queryKey = ["get", "/categories", undefined];

  const { mutate } = $api.useMutation("delete", "/categories/{id}", {
    onMutate: () => {
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: Category[]) => {
        if (formProps.isSub) {
          const parent = old.find(c => c.id === formProps.parentId);
          if (!!parent) {
            const sub = parent.sub || [];
            return old.map(c => 
              (c.id === formProps.parentId) 
              ? { ...parent, sub: sub.filter(s => s.id !== id) } 
              : c
            );
          }
        } else {
          return old.filter(c => c.id !== id)
        }
      });

      return { previous };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const submit = () => {
    mutate({ params: {
      path: { id }
    }});
    
    context.closeModal(modalId);
  }

  return(
    <>
      <Text>
        ジャンルを削除します．
        よろしいですか？
      </Text>
      <Group justify='flex-end' mt="md">
        <Button 
          color='red' 
          leftSection={<IconTrash />}
          onClick={submit}
        >
          削除
        </Button>
      </Group>
    </>
  );
}

export default CategoryDeleteModal;