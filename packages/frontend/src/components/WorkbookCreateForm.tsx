import { Button, Group, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { isNotEmpty, useForm } from "@mantine/form";
import { IconPencil } from "@tabler/icons-react";

interface WorkbookCreateFormProps {
  name?: string;
  date?: Date;
  onSubmit?: (name: string, published?: Date) => void;
  onClose?: () => void;
}

export default function WorkbookCreateForm({
  name,
  date,
  onSubmit = () => {},
  onClose = () => {},
}: WorkbookCreateFormProps) {
  const form = useForm({
    initialValues: {
      name: name,
      date: date && new Date(date),
    },
    validate: {
      name: isNotEmpty(),
    },
  });
  const icon = <IconPencil />;

  const submit = (v: { name?: string; date?: Date }) => {
    onSubmit(v.name || "", v.date);
    form.reset();
  };

  return (
    <form onSubmit={form.onSubmit((v) => submit(v))}>
      <TextInput label="問題集の名前" {...form.getInputProps("name")} />
      <DateInput
        clearable
        valueFormat="YYYY/MM/DD"
        label="問題集の発行年月日"
        decadeLabelFormat="YYYY年"
        yearLabelFormat="YYYY年"
        monthLabelFormat="YYYY年 MMMM"
        {...form.getInputProps("date")}
      />
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
