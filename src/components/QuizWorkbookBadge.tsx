import { Badge, BadgeProps } from "@mantine/core";

interface Props extends BadgeProps {
  workbookName: string,
  levelColor: string,
  date: string,
  isMobile?: boolean,
}

export function QuizWorkbookBadge({
  workbookName,
  levelColor,
  date,
  isMobile = false,
  ...other
}: Props) {

  return (
    <Badge 
      color={levelColor} 
      radius="sm"
      size={ isMobile ? "md" : "lg" }
      {...other}
    >
      {workbookName}({date.slice(0, 4)})
    </Badge>
  )
}