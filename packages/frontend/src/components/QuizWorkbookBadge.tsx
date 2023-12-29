import { Badge, BadgeProps } from "@mantine/core";
import { useIsMobile } from "@/contexts/isMobile";

interface Props extends BadgeProps {
  workbookName: string,
  levelColor: string,
  date: string,
}

export function QuizWorkbookBadge({
  workbookName,
  levelColor,
  date,
  ...other
}: Props) {
  const isMobile = useIsMobile();

  return (
    <Badge 
      color={levelColor} 
      radius="sm"
      size={ isMobile ? "md" : "lg" }
      {...other}
    >
      {workbookName}{!!date ? `${(date.slice(0, 4))}` : null}
    </Badge>
  )
}