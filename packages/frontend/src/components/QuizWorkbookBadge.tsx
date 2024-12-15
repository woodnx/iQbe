import { Badge, BadgeProps } from "@mantine/core";
import { useIsMobile } from "@/contexts/isMobile";
import { components } from "api/schema";

type Workbook = components["schemas"]["Workbook"];

interface Props extends BadgeProps {
  workbook: Workbook,
  levelColor: string,
  transformUpper?: boolean,
}

export function QuizWorkbookBadge({
  workbook,
  levelColor,
  transformUpper,
  ...other
}: Props) {
  const isMobile = useIsMobile();

  return (
    <Badge 
      variant="dot"
      color={levelColor} 
      radius="sm"
      size={ isMobile ? "md" : "lg" }
      style={{ textTransform: 'none', backgroundColor: '#fff' }}
      {...other}
    >
      <div>
        {workbook?.name}
        {/* {!!workbook?.date ? `(${workbook?.date.slice(0, 4)})` : null} */}
      </div>
    </Badge>
  )
}