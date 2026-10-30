import { useIsMobile } from "@/contexts/isMobile";
import type { Workbook as ApiWorkbook } from "@/utils/api-types";
import { Badge, BadgeProps } from "@mantine/core";

type Workbook = ApiWorkbook;

interface Props extends BadgeProps {
  workbook: Workbook;
  transformUpper?: boolean;
}

export function QuizWorkbookBadge({ workbook, ...other }: Props) {
  const isMobile = useIsMobile();

  return (
    <Badge
      color="gray"
      radius="sm"
      size={isMobile ? "md" : "lg"}
      style={{ textTransform: "none" }}
      {...other}
    >
      <div>
        {workbook?.name}
        {/* {!!workbook?.date ? `(${workbook?.date.slice(0, 4)})` : null} */}
      </div>
    </Badge>
  );
}
