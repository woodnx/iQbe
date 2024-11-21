import { ContextModalProps } from "@mantine/modals";
import CategoryEditForm from "./CategoryEditForm";
import { $api } from "@/utils/client";

export interface CategoryCreateModalInnerProps<T extends boolean> {
  name: string,
  description?: string,
  isSub: T,
  parentId: T extends true ? number : undefined,
}

export default function CategoryCreateModal<T extends boolean>({
  context,
  id: modalId,
  innerProps,
}: ContextModalProps<CategoryCreateModalInnerProps<T>>) {
  const { ...formProps } = innerProps;
  const { mutateAsync: edit } = $api.useMutation("post", "/categories");

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