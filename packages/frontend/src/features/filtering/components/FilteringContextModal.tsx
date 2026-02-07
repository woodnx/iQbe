import { QuizRequestParams } from "@/types";
import { ContextModalProps } from "@mantine/modals";

import FilteringForm from "./FilteringForm";

interface FilteringContextModalInnerProps {
  isFilterKeyword?: boolean;
  onSubmit?: (params: QuizRequestParams) => void;
}

export default function FilteringContextModal({
  id,
  context,
  innerProps,
}: ContextModalProps<FilteringContextModalInnerProps>) {
  const { onSubmit = () => {}, isFilterKeyword } = innerProps;

  return (
    <>
      <FilteringForm
        isFilterKeyword={isFilterKeyword}
        onSubmit={(v) => {
          onSubmit(v);
          context.closeModal(id);
        }}
      />
    </>
  );
}
