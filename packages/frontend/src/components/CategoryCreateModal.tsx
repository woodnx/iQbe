import { components } from 'api/schema';

import { $api } from '@/utils/client';
import { ContextModalProps } from '@mantine/modals';
import { useQueryClient } from '@tanstack/react-query';

import CategoryEditForm from './CategoryEditForm';

export interface CategoryCreateModalInnerProps<T extends boolean> {
  name: string,
  description?: string,
  isSub: T,
  parentId: T extends true ? number : undefined,
}

type Category = components['schemas']['Category'];

export default function CategoryCreateModal<T extends boolean>({
  context,
  id: modalId,
  innerProps,
}: ContextModalProps<CategoryCreateModalInnerProps<T>>) {
  const { ...formProps } = innerProps;
  const queryClient = useQueryClient();
  const queryKey = ["get", "/categories", undefined];

  const { mutate: edit } = $api.useMutation("post", "/categories", {
    onMutate: async ({ body }) => {
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: Category[]) => [
        ...old, 
        body
      ]);

      return { previous };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  });

  const submit = (
    name: string,
    parentId: T extends true ? number : undefined,
    description?: string,
  ) => {
    edit({ body: {
      name,
      description,
      parentId,
    }});
    
    context.closeModal(modalId);
  }

  return(
    <CategoryEditForm
      {...formProps}
      onSubmit={(name, parentId, description) => submit(name, parentId, description)}
    />
  );
}