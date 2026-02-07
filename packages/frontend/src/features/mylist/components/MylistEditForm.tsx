import { BoxProps, Button, Group, TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { IconPencil } from "@tabler/icons-react";

interface Props extends BoxProps {
  name?: string;
  onSave?: (name: string) => void;
  onClose?: () => void;
}

export default function MylistEditForm({
  name,
  onSave = () => {},
  onClose = () => {},
}: Props) {
  const form = useForm({
    initialValues: {
      name: name,
    },
    validate: {
      name: isNotEmpty(),
    },
  });
  const icon = <IconPencil />;

  const submit = (v: { name?: string }) => {
    onSave(v.name || "");
  };

  return (
    <form onSubmit={form.onSubmit((v) => submit(v))}>
      <TextInput {...form.getInputProps("name")} />
      <Group justify="space-between" mt="sm">
        <Button variant="outline" color="gray" onClick={onClose}>
          キャンセル
        </Button>
        <Button type="submit" leftSection={icon} disabled={!form.isValid()}>
          保存
        </Button>
      </Group>
    </form>
  );
}
