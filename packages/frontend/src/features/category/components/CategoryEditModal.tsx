import { ContextModalProps } from "@mantine/modals";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import type { Category as ApiCategory } from "@/utils/api-types";
import { readResponse, rpc } from "@/utils/client";
import CategoryEditForm from "./CategoryEditForm";

export interface CategoryEditModalInnerProps<T extends boolean> {
  name: string;
  description?: string;
  disabled: boolean;
  isSub: T;
  parentId: T extends true ? number : undefined;
  id: number;
}

type Category = ApiCategory;

export default function CategoryEditModal<T extends boolean>({
  context,
  id: modalId,
  innerProps,
}: ContextModalProps<CategoryEditModalInnerProps<T>>) {
  const { id, ...formProps } = innerProps;
  const queryClient = useQueryClient();
  const queryKey = ["get", "/categories"];

  const { mutate: edit } = useMutation({
    mutationKey: ["put", "/categories/{id}"],
    mutationFn: (
      input: InferRequestType<(typeof rpc.api.categories)[":id"]["$put"]>,
    ) => rpc.api.categories[":id"].$put(input).then(readResponse),
    onMutate: async ({ json: body }) => {
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: Category[] | undefined) => {
        const data = old?.map((c) => {
          if (formProps.isSub) {
            if (c.id === formProps.parentId) {
              return {
                ...c,
                sub: c.sub?.map((sub) =>
                  sub.id === id ? { ...sub, ...body } : sub,
                ),
              };
            }
            return c;
          } else {
            return c.id === id ? { ...c, ...body } : c;
          }
        });

        return data;
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

  const submit = (name: string, disabled: boolean, description?: string) => {
    edit({
      json: {
        name,
        description,
        disabled,
      },
      param: { id },
    });

    context.closeModal(modalId);
  };

  return (
    <CategoryEditForm
      {...formProps}
      onSubmit={(name, disabled, _, description) =>
        submit(name, disabled, description)
      }
    />
  );
}
