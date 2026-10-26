import type { Category as ApiCategory } from "@/utils/api-types";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/utils/api";

import { Button, Group, Text } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";

type Category = ApiCategory;

export interface CategoryCreateModalInnerProps<T extends boolean> {
  id: number;
  isSub: T;
  parentId: T extends true ? number : undefined;
}

const CategoryDeleteModal = <T extends boolean>({
  context,
  id: modalId,
  innerProps,
}: ContextModalProps<CategoryCreateModalInnerProps<T>>) => {
  const { id, ...formProps } = innerProps;
  const queryClient = useQueryClient();
  const queryKey = ["get", "/categories"];

  const { mutate } = useMutation({
    mutationKey: ["delete", "/categories/{id}"],
    mutationFn: api.deleteCategoriesId,
    onMutate: () => {
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: Category[] | undefined) => {
        if (!old) return old;

        if (formProps.isSub) {
          const parent = old.find((c) => c.id === formProps.parentId);
          if (!!parent) {
            const sub = parent.sub || [];
            return old.map((c) =>
              c.id === formProps.parentId
                ? { ...parent, sub: sub.filter((s) => s.id !== id) }
                : c,
            );
          }
        } else {
          return old.filter((c) => c.id !== id);
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

  const submit = () => {
    mutate({
      params: {
        path: { id },
      },
    });

    context.closeModal(modalId);
  };

  return (
    <>
      <Text>ジャンルを削除します． よろしいですか？</Text>
      <Group justify="flex-end" mt="md">
        <Button color="red" leftSection={<IconTrash />} onClick={submit}>
          削除
        </Button>
      </Group>
    </>
  );
};

export default CategoryDeleteModal;
