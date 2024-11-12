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
  const { mutateAsync: editSub } = $api.useMutation("post", "/categories/sub");

  const submit = (
    name: string,
    parentId: T extends true ? number : undefined,
    description?: string,
  ) => {
    if (formProps.isSub) {
      editSub({ body: {
        name,
        description,
        parentId: parentId || 0,
      }});
    } 
    else {
      edit({ body: {
        name,
        description,
      }});
    }
    context.closeModal(modalId);
  }

  return(
    <CategoryEditForm
      {...formProps}
      onSubmit={(name, parentId, description) => submit(name, parentId, description)}
    />
  );
}