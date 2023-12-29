import React, { forwardRef } from "react";
import { Button, Card, DefaultProps, Grid, Group, Select, Switch, Text, Textarea } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form"
import { useCategories, useSubCategories } from "@/hooks/useCategories";
import { useWorkbooks } from "@/hooks/useWorkbooks";
import { SubmitValue } from "@/types";

interface Props extends DefaultProps {
  question?: string,
  answer?: string,
  onSubmit?: (v: SubmitValue) => void,
}

interface ItemProps extends React.ComponentPropsWithRef<'div'> {
  label: string,
  description: string,
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, description, ...others}: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Text size="sm">{label}</Text>
      <Text size="xs" opacity={0.65}>
        {description}
      </Text>
    </div>
  )
)

export default function QuizEditForm({
  question: initialQuestion,
  answer: initialAnswer,
  onSubmit = () => {},
  ...others
}: Props) {
  const { categories: ct } = useCategories();
  const { subCategories: sct } = useSubCategories();
  const { workbooks: wkb } = useWorkbooks();

  const form = useForm({
    initialValues: {
      question: initialQuestion || '',
      answer: initialAnswer || '',
      isPublic: false,
      category: '',
      subCategory: '',
      workbook: '',
    },
    validate: {
      question: isNotEmpty(),
      answer: isNotEmpty(),
    },
  });

  const categories = ct?.map(c => ({ ...c, value: String(c.id), label: c.name}));
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
          <Grid.Col md={6}>
            <Select
              value={form.values.workbook} 
              onChange={(w) => form.setValues({ workbook: w || "" })} 
              data={workbooks || []} 
              label="Workbook"
              withinPortal
              clearable
              searchable
            />
          </Grid.Col>
          <Grid.Col md={9}>
            <Select
              value={form.values.category} 
              onChange={(c) => form.setValues({ category: c || "" })} 
              itemComponent={SelectItem}
              data={categories || []} 
              label="Genre"
              withinPortal
            />
          </Grid.Col>
          <Grid.Col md={9}>
            <Select 
              key={form.values.category}
              value={form.values.subCategory} 
              onChange={(c) => form.setValues({ subCategory: c || "" })}
              itemComponent={SelectItem}
              data={subCategories || []} 
              label="Sub genre"
              withinPortal
            />
          </Grid.Col>
        </Grid>
        <Group position="apart" mt="sm">
          <Switch
            checked={form.values.isPublic}
            onChange={() => form.setValues({ isPublic: !form.values.isPublic })}
            label="Publish quiz"
            my="sm"
          />
          <Button
            disabled={!form.isValid()}
            type="submit"
          >Create</Button>
        </Group>
      </form>
    </Card>
  )
}