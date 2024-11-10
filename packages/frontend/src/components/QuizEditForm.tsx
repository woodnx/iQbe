import { Button, Card, BoxProps, Grid, Group, Switch, Textarea } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form"
import { useCategories, useSubCategories } from "@/hooks/useCategories";
import { SubmitValue } from "@/types";
import CategorySelector from "./CategorySelector";
import WorkbookCreateAndSelector from "./WorkbookCreateAndSelector";
import { useIsSuperUser } from "@/hooks/useLoginedUser";
import TagInput from "./TagInput";

interface QuizEditFormProps extends BoxProps {
  question?: string,
  answer?: string,
  workbook?: string,
  category?: number,
  subCategory?: number,
  tags?: string[],
  isPublic?: boolean,
  onSubmit?: (v: SubmitValue) => void,
}

export default function QuizEditForm({
  question: initialQuestion,
  answer: initialAnswer,
  workbook: initialWorkbook,
  category: initialCategory,
  subCategory: initialSubCategory,
  tags: initialTags,
  isPublic: initialIsPublic,
  onSubmit = () => {},
  ...others
}: QuizEditFormProps) {
  const isSuperUser = useIsSuperUser();
  const { categories } = useCategories();
  const { subCategories: sct } = useSubCategories();

  const form = useForm({
    initialValues: {
      question: initialQuestion,
      answer: initialAnswer,
      isPublic: !!initialIsPublic,
      category: initialCategory,
      subCategory: initialSubCategory,
      tags: initialTags,
      workbook: initialWorkbook,
    },
    validate: {
      question: isNotEmpty(),
      answer: isNotEmpty(),
    },
  });

  const subCategories = sct?.filter(c => 
    c.parentId === Number(form.values.category)
  ).map(c => ({
    ...c, 
    value: String(c.id), 
    label: c.name
  }));

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
          <Grid.Col span={8}>
            <TagInput 
              {...form.getInputProps('tags')}
            />
          </Grid.Col>
          <Grid.Col span={8}>
            <WorkbookCreateAndSelector
              mb="md"
              {...form.getInputProps('workbook')}
            />
          </Grid.Col>
          
        </Grid>
        <Group justify="space-between" mt="sm">
          <Switch
            {...form.getInputProps('isPublic', {type: 'checkbox'})}
            disabled={!isSuperUser}
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