import useQuizzes from "@/hooks/useQuizzes";
import { Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSearch } from "@tabler/icons-react";

import FilteringCategories from "./FilteringCategories";
import FilteringQuizNumber from "./FilteringQuizNumber";
import FilteringTagMatchAll from "./FilteringTagMatchAll";
import FilteringTags from "./FilteringTags";
import FilteringWorkbook from "./FilteringWorkbook";
import { QuizRequestParams } from "@/types";
import FilteringWord from "./FilteringWord";

interface FilteringModalProps {
  isFilterKeyword?: boolean;
  onSubmit?: (params: QuizRequestParams) => void;
}

export default function FilteringModal({
  isFilterKeyword = false,
  onSubmit = () => {},
}: FilteringModalProps) {
  const { params } = useQuizzes();
  const form = useForm({
    initialValues: {
      wids: params.wids,
      keyword: params.keyword,
      keywordOption: params.keywordOption,
      maxView: params.maxView,
      categories: params.categories,
      tags: params.tags,
      tagMatchAll: params.tagMatchAll,
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
      <FilteringTagMatchAll
        {...form.getInputProps("tagMatchAll", { type: "checkbox" })}
        mb="lg"
      />
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
