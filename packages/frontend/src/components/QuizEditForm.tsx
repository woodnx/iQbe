import { Button, Card, BoxProps, Grid, Group, Switch, Textarea } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form"
import { useCategories, useSubCategories } from "@/hooks/useCategories";
import { SubmitValue } from "@/types";
import CategorySelector from "./CategorySelector";
import WorkbookCreateAndSelector from "./WorkbookCreateAndSelector";

interface Props extends BoxProps {
  question?: string,
  answer?: string,
  workbook?: string,
  category?: number,
  subCategory?: number,
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

  const subCategories = sct?.filter(c => c.parentId === Number(form.values.category)).map(c => ({ ...c, value: String(c.id), label: c.name}));

  const submit = (v: SubmitValue) => {
    onSubmit(v);
    form.reset();
  }

  return (
    <Card padding={0} {...others}>
      <form onSubmit={form.onSubmit(v => submit(v))}>
        <Textarea
          {...form.getInputProps('question')}
          placeholder="問題文を入力"
          label="問題文"
          variant="filled"
          autosize
          minRows={2}
          mb="md"
        />
        <Textarea
          {...form.getInputProps('answer')}
          placeholder="解答を入力"
          label="解答"
          variant="filled"
          autosize
          mb="md"
        />
        <Grid>
          <Grid.Col span={{ base: 12, xs: 6 }}>
            <WorkbookCreateAndSelector
              mb="md"
              {...form.getInputProps('workbook')}
            />
          </Grid.Col>
        </Grid>
        <Grid>
          <Grid.Col span={6}>
            <CategorySelector
              label="ジャンル"
              data={categories || []}
              onClear={() => form.setFieldValue('subCategory', undefined)}
              {...form.getInputProps('category')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <CategorySelector
              label="サブジャンル"
              placeholder="サブジャンルを選択"
              key={form.values.category}
              data={subCategories || []} 
              {...form.getInputProps('subCategory')}
            />
          </Grid.Col>
        </Grid>
        <Group justify="space-between" mt="sm">
          <Switch
            {...form.getInputProps('isPublic', {type: 'checkbox'})}
            label="クイズを公開する"
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