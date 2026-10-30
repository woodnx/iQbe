import { Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSearch } from "@tabler/icons-react";
import { QuizRequestParams } from "@/types";
import FilteringCategories from "./FilteringCategories";
import FilteringQuizNumber from "./FilteringQuizNumber";
import FilteringTagMatchAll from "./FilteringTagMatchAll";
import FilteringTags from "./FilteringTags";
import FilteringWord from "./FilteringWord";
import FilteringWorkbook from "./FilteringWorkbook";

interface FilteringModalProps {
  isFilterKeyword?: boolean;
  onSubmit?: (params: QuizRequestParams) => void;
}

export default function FilteringModal({
  isFilterKeyword = false,
  onSubmit = () => {},
}: FilteringModalProps) {
  const form = useForm({
    initialValues: {
      wids: undefined,
      keyword: "",
      keywordOption: 1,
      maxView: 100,
      categories: undefined,
      tags: undefined,
      tagMatchAll: false,
    },
  });

  return (
    <>
      {isFilterKeyword && (
        <FilteringWord
          wordInputProps={form.getInputProps("keyword")}
          wordSearchOption={form.getInputProps("keywordOption", {
            type: "checkbox",
          })}
          mb="lg"
        />
      )}
      <FilteringWorkbook {...form.getInputProps("wids")} mb="lg" />
      <FilteringCategories {...form.getInputProps("categories")} mb="lg" />
      <FilteringTags {...form.getInputProps("tags")} />
      <FilteringTagMatchAll {...form.getInputProps("tagMatchAll")} mb="lg" />
      <FilteringQuizNumber {...form.getInputProps("maxView")} />
      <Group mt="lg" justify="right">
        <Button
          leftSection={<IconSearch />}
          onClick={() => onSubmit(form.getValues())}
        >
          検索
        </Button>
      </Group>
    </>
  );
}
