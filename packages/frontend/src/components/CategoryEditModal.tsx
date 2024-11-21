import { ContextModalProps } from "@mantine/modals";
import CategoryEditForm from "./CategoryEditForm";
import { $api } from "@/utils/client";

export interface CategoryEditModalInnerProps<T extends boolean> {
  name: string,
  description?: string,
  isSub: T,
  parentId: T extends true ? number : undefined,
  id: number,
}

export default function CategoryEditModal<T extends boolean>({
  context,
  id: modalId,
  innerProps,
}: ContextModalProps<CategoryEditModalInnerProps<T>>) {
  const { id, ...formProps } = innerProps;
  const { mutateAsync: edit } = $api.useMutation("put", "/categories/{id}");

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