import { Button, Group, TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";

export interface CategoryEditFormProps<T extends boolean> {
  isSub: T,
  name?: string,
  description?: string,
  parentId: T extends true ? number : undefined,
  onSubmit?: (name: string, parentId: T extends true ? number : undefined, description?: string) => void,
}

export default function CategoryEditForm<T extends boolean>({
  name = '',
  description = '',
  parentId,
  onSubmit = () => {},
}: CategoryEditFormProps<T>) {
  const form = useForm({
    initialValues: {
      name,
      description,
      parentId,
    },
    validate: {
      name: isNotEmpty(),
    }
  });

  const submit = (
    name: string, 
    parentId: T extends true ? number : undefined,
    description?: string,
  ) => {
    onSubmit(name, parentId, description);
    form.reset();
  };

  return (
    <form onSubmit={form.onSubmit(v => submit(v.name, v.parentId, v.description))}>
      <TextInput 
        {...form.getInputProps('name')}
        label="ジャンル名"
        variant="filled"
        withAsterisk
        mb="md"
      />
      <TextInput 
        {...form.getInputProps('description')}
        label="ジャンルの説明"
        variant="filled"
        mb="md"
      />
      <Group justify="flex-end">
        <Button
          disabled={!form.isValid()}
          type="submit"
        >
          { !!name ? '更新' : '新規作成' }
        </Button>
      </Group>
    </form>
  )
}