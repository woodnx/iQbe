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
  const { mutateAsync: edit } = $api.useMutation("put", "/categories");
  const { mutateAsync: editSub } = $api.useMutation("put", "/categories/sub");

  const submit = (
    name: string,
    parentId: T extends true ? number : undefined,
    description?: string,
  ) => {
    if (formProps.isSub) {
      editSub({ body: {
        id,
        name,
        description,
        parentId,
      }});
    } 
    else {
      edit({ body: {
        id,
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