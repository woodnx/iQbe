import { Button, ButtonProps, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { components } from "api/schema";

import CategoryPresetModal from "./CategoryPresetModal";
import { $api } from "@/utils/client";
import { useQueryClient } from "@tanstack/react-query";

interface CategoryPresetButtonProps extends ButtonProps {}
type Category = components["schemas"]["Category"];

const CategoryPresetButton = ({ ...others }: CategoryPresetButtonProps) => {
  const [opened, { close, open }] = useDisclosure();

  const queryClient = useQueryClient();
  const queryKey = ["get", "/categories", undefined];
  const { mutate } = $api.useMutation("post", "/categories/preset", {
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: Category[] | undefined) =>
        old?.map((category) => ({
          ...category,
          disabled: true,
          sub: category.sub?.map((sub) => ({ ...sub, disabled: true })) || null,
        })),
      );

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

  const addPreset = (preset: string) => {
    close();
    mutate({
      body: {
        preset,
      },
    });
  };

  return (
    <>
      <Modal title="ジャンルの一括追加" opened={opened} onClose={close}>
        <CategoryPresetModal onSave={addPreset} />
      </Modal>
      <Button {...others} onClick={open}>
        プリセットから一括追加
      </Button>
    </>
  );
};

export default CategoryPresetButton;
