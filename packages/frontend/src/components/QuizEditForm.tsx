import { paths } from 'api/schema';

import { useCategories } from '@/hooks/useCategories';
import { useIsSuperUser } from '@/hooks/useLoginedUser';
import { BoxProps, Button, Card, Grid, Group, Switch, Textarea } from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';

import CategorySelector from './CategorySelector';
import TagInput from './TagInput';
import WorkbookCreateAndSelector from './WorkbookCreateAndSelector';

type QuizEditSubmitValues = paths["/quizzes"]["post"]["requestBody"]["content"]["application/json"];

interface QuizEditFormProps extends BoxProps {
  question: string,
  answer: string,
  wid?: string,
  category?: number,
  subCategory?: number,
  tags?: string[],
  isPublic?: boolean,
  onSubmit?: (v: QuizEditSubmitValues) => void,
}

export default function QuizEditForm({
  question,
  answer,
  wid,
  category,
  subCategory,
  tags,
  isPublic,
  onSubmit = () => {},
  ...others
}: QuizEditFormProps) {
  const isSuperUser = useIsSuperUser();
  const { categories } = useCategories();

  const form = useForm({
    initialValues: {
      question,
      answer,
      isPublic,
      category,
      subCategory,
      tags,
      wid,
    },
    validate: {
      question: isNotEmpty(),
      answer: isNotEmpty(),
    },
  });

  const subCategories = categories?.find(c => c.id == form.values.category)?.sub || [];

  const submit = (v: QuizEditSubmitValues) => {
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
              {...form.getInputProps('wid')}
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
          >{ !!question ? 'Edit' : 'Create' }</Button>
        </Group>
      </form>
    </Card>
  )
}