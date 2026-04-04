import { ActionIcon, Button, ButtonProps } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconFilter } from "@tabler/icons-react";
import { useIsMobile } from "@/contexts/isMobile";
import { QuizRequestParams } from "@/types";

export interface FilteringModalButton extends ButtonProps {
  onSubmit?: (
    wids?: string | string[],
    keyword?: string,
    keywordOption?: number,
    categories?: number | number[],
    tags?: string | string[],
    tagMatchAll?: boolean,
    maxView?: number,
  ) => void;
  onClose?: () => void;
}

export default function FilteringModalButton({
  onSubmit = () => {},
  onClose = () => {},
  ...others
}: FilteringModalButton) {
  const isMobile = useIsMobile();

  const click = () => {
    modals.openContextModal({
      modal: "quizFiltering",
      size: "lg",
      title: "絞り込み",
      innerProps: {
        isFilterKeyword: true,
        onSubmit: (v: QuizRequestParams) => {
          onSubmit(
            v.wids || undefined,
            v.keyword || undefined,
            v.keywordOption || undefined,
            v.categories || undefined,
            v.tags || undefined,
            v.tagMatchAll || undefined,
            v.maxView || undefined,
          );
        },
      },
      onClose,
    });
  };

  const DefaultButton = () => (
    <Button
      leftSection={<IconFilter />}
      color="orange"
      radius="md"
      variant="light"
      onClick={click}
      {...others}
    >
      絞り込み
    </Button>
  );

  const MobileButton = () => (
    <ActionIcon
      color="orange"
      size="lg"
      radius="xl"
      variant="light"
      onClick={click}
    >
      <IconFilter />
    </ActionIcon>
  );

  return <>{isMobile ? <MobileButton /> : <DefaultButton />}</>;
}
