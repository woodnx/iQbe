import { Button, Card, BoxProps, Grid, Group, Select, Switch, Textarea } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form"
import { useCategories, useSubCategories } from "@/hooks/useCategories";
import { useWorkbooks } from "@/hooks/useWorkbooks";
import { SubmitValue } from "@/types";
import CategorySelector from "./CategorySelector";

interface Props extends BoxProps {
  question?: string,
  answer?: string,
  workbook?: string,
  category?: string | null,
  subCategory?: string | null,
  isPublic?: boolean,
  onSubmit?: (v: SubmitValue) => void,
}

export default function QuizEditForm({
  question: initialQuestion,
  answer: initialAnswer,
  workbook: initialWorkbook,
  category: initialCategory,
  subCategory: initialSubCategory,
  isPublic: initialIsPublic,
  onSubmit = () => {},
  ...others
}: Props) {
  const { categories } = useCategories();
  const { subCategories: sct } = useSubCategories();
  const { workbooks: wkb } = useWorkbooks('/user');

  const form = useForm({
    initialValues: {
      question: initialQuestion,
      answer: initialAnswer,
      isPublic: !!initialIsPublic,
      category: initialCategory,
      subCategory: initialSubCategory,
      workbook: initialWorkbook,
    },
    validate: {
      question: isNotEmpty(),
      answer: isNotEmpty(),
    },
  });

  const subCategories = sct?.filter(c => c.parent_id === Number(form.values.category)).map(c => ({ ...c, value: String(c.id), label: c.name}));
  const workbooks = wkb?.map(w => ({ ...w, value: w.wid, label: w.name}));

  const submit = (v: SubmitValue) => {
    onSubmit(v);
    form.reset();
  }

  return (
    <Card padding={0} {...others}>
      <form onSubmit={form.onSubmit(v => submit(v))}>
        <Textarea
          {...form.getInputProps('question')}
          placeholder="Question"
          label="Question"
          variant="filled"
          autosize
          minRows={2}
        />
        <Textarea
          {...form.getInputProps('answer')}
          placeholder="Answer"
          label="Answer"
          variant="filled"
          autosize
          my="sm"
        />

        <Grid grow columns={24}>
          <Grid.Col span={{ md: 6 }}>
            <Select
              {...form.getInputProps('workbook')}
              defaultValue={initialWorkbook}
              data={workbooks || []} 
              label="Workbook"
              clearable
              searchable
            />
          </Grid.Col>
          <Grid.Col span={{ md: 9 }}>
            <CategorySelector
              label="Genre"
              data={categories}
              onClear={() => form.setFieldValue('subCategory', null)}
              {...form.getInputProps('category')}
            />
          </Grid.Col>
          <Grid.Col span={{ md: 9 }}>
            <CategorySelector
              label="Sub genre"
              key={form.values.category}
              data={subCategories || []} 
              {...form.getInputProps('subCategory')}
            />
          </Grid.Col>
        </Grid>
        <Group justify="space-between" mt="sm">
          <Switch
            {...form.getInputProps('isPublic', {type: 'checkbox'})}
            label="Publish quiz"
            my="sm"
          />
          <Button
            disabled={!form.isValid()}
            type="submit"
          >{ !!initialQuestion ? 'Edit' : 'Create' }</Button>
        </Group>
      </form>
    </Card>
  )
}