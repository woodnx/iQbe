import { components } from 'api/schema';

import { $api } from '@/utils/client';
import { ContextModalProps } from '@mantine/modals';

import CategoryEditForm from './CategoryEditForm';
import { useQueryClient } from '@tanstack/react-query';

export interface CategoryEditModalInnerProps<T extends boolean> {
  name: string,
  description?: string,
  isSub: T,
  parentId: T extends true ? number : undefined,
  id: number,
}

type Category = components['schemas']['Category'];

export default function CategoryEditModal<T extends boolean>({
  context,
  id: modalId,
  innerProps,
}: ContextModalProps<CategoryEditModalInnerProps<T>>) {
  const { id, ...formProps } = innerProps;
  const queryClient = useQueryClient();
  const queryKey = ["get", "/categories", undefined];

  const { mutate: edit } = $api.useMutation("put", "/categories/{id}", {
    onMutate: async ({ body }) => {
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: Category[] | undefined) => {
        const data = old?.map(c => c.id === id ? { ...c, ...body } : c);
        return data;
      });

      return { previous };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  },);

  const submit = (
    name: string,
    description?: string,
  ) => {
    edit({ 
      body: {
        name,
        description,
      },
      params: { 
        path: { id },
      }
    });

    context.closeModal(modalId);
  }

  return(
    <CategoryEditForm
      {...formProps}
      onSubmit={(name, _, description) => submit(name, description)}
    />
  );
}