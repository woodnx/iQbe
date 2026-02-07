import { components } from "api/schema";

import { $api } from "@/utils/client";
import { ContextModalProps } from "@mantine/modals";
import { useQueryClient } from "@tanstack/react-query";

import CategoryEditForm from "./CategoryEditForm";

export interface CategoryCreateModalInnerProps<T extends boolean> {
  name: string;
  description?: string;
  isSub: T;
  parentId: T extends true ? number : undefined;
}

type Category = components["schemas"]["Category"];

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

      queryClient.setQueryData(queryKey, (old: Category[] | undefined) => {
        if (!old) return old;

        if (formProps.isSub) {
          const parent = old.find((c) => c.id === formProps.parentId);
          if (!!parent) {
            const sub = parent.sub || [];
            return old.map((c) =>
              c.id === formProps.parentId
                ? { ...parent, sub: [...sub, body] }
                : c,
            );
          }
        } else {
          return [...old, body];
        }
      });

      return { previous };
    },
    onError: (_, __, context) => {
      const rollback = context as { previous: unknown } | undefined;
      if (!rollback) return;
      queryClient.setQueryData(queryKey, rollback.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const submit = (
    name: string,
    disabled: boolean,
    parentId: T extends true ? number : undefined,
    description?: string,
  ) => {
    edit({
      body: {
        name,
        description,
        parentId,
        disabled,
      },
    });

    context.closeModal(modalId);
  };

  return <CategoryEditForm {...formProps} onSubmit={submit} />;
}
