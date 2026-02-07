import { BoxProps, Button, Card, Grid, Group, Textarea } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { components, paths } from "api/schema";

import CategorySelector from "@/features/category/components/CategorySelector";
import TagInput from "@/features/tag/components/TagInput";
import WorkbookCreateAndSelector from "@/features/workbook/components/WorkbookCreateAndSelector";

type QuizEditSubmitValues =
  paths["/quizzes"]["post"]["requestBody"]["content"]["application/json"];
type Category = components["schemas"]["Category"];

interface QuizEditFormProps extends BoxProps {
  question: string;
  answer: string;
  wid?: string;
  category?: Category[];
  tags?: string[];
  onSubmit?: (v: QuizEditSubmitValues) => void;
  disabled?: boolean;
}

export default function QuizEditForm({
  question,
  answer,
  wid,
  category,
  tags,
  onSubmit = () => {},
  disabled,
  ...others
}: QuizEditFormProps) {
  const form = useForm({
    initialValues: {
      question,
      answer,
      category,
      tags,
      wid,
    },
    validate: {
      question: isNotEmpty(),
      answer: isNotEmpty(),
    },
  });

  const submit = (v: QuizEditSubmitValues) => {
    onSubmit(v);
    form.reset();
  };

  return (
    <Card padding={0} {...others}>
      <form
        onSubmit={form.onSubmit((v) => {
          const { category, ...value } = v;
          const categoryId =
            category && category.length > 1
              ? category[1].id
              : category && category.length > 0
                ? category[0].id
                : undefined;

          submit({
            ...value,
            category: categoryId,
          });
        })}
      >
        <Textarea
          {...form.getInputProps("question")}
          placeholder="問題文を入力"
          label="問題文"
          variant="filled"
          autosize
          minRows={2}
          mb="sm"
          disabled={disabled}
        />
        <Textarea
          {...form.getInputProps("answer")}
          placeholder="解答を入力"
          label="解答"
          variant="filled"
          autosize
          mb="sm"
          disabled={disabled}
        />
        <CategorySelector
          {...form.getInputProps("category")}
          mb="sm"
          disabled={disabled}
        />
        <Grid>
          <Grid.Col span={8}>
            <TagInput {...form.getInputProps("tags")} disabled={disabled} />
          </Grid.Col>
          <Grid.Col span={8}>
            <WorkbookCreateAndSelector
              mb="md"
              {...form.getInputProps("wid")}
              disabled={disabled}
            />
          </Grid.Col>
        </Grid>
        <Group justify="space-between" mt="sm">
          {!disabled && (
            <Button disabled={!form.isValid()} type="submit">
              保存
            </Button>
          )}
        </Group>
      </form>
    </Card>
  );
}
