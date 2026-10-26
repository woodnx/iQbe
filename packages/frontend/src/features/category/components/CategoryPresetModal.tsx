import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { useState } from "react";

import { Alert, Button, Group, RadioGroup, Stack } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

import CategoryPresetRadioCard from "./CategoryPresetRadioCard";

interface CategoryPresetModalProps {
  onSave?: (preset: string) => void;
}

const CategoryPresetModal = ({
  onSave = () => {},
}: CategoryPresetModalProps) => {
  const [value, setValue] = useState<string | null>(null);
  const { data: presets } = useQuery({
    queryKey: ["get", "/categories/preset"],
    queryFn: ({ signal }) => api.getCategoriesPreset({}, signal),
  });

  const cards = presets?.map((item) => (
    <CategoryPresetRadioCard
      key={item.value}
      value={item.value}
      name={item.name}
      description={item.description || ""}
      tag={item.tag || undefined}
    />
  ));

  return (
    <>
      <RadioGroup
        value={value}
        onChange={setValue}
        label="ジャンルのプリセットを選択"
        withAsterisk
      >
        <Stack>{cards}</Stack>
      </RadioGroup>
      <Alert mt="md" color="yellow" icon={<IconAlertTriangle />}>
        プリセットから追加すると、すでに追加されているジャンルは無効化されます（再有効化は可能です）。
      </Alert>

      <Group justify="flex-end" mt="md">
        <Button
          color="green"
          size="sm"
          disabled={!value}
          onClick={() => onSave(value || "")}
        >
          追加
        </Button>
      </Group>
    </>
  );
};

export default CategoryPresetModal;
