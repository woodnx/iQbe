import { Badge, BadgeProps } from "@mantine/core";

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
  return (
    <Badge color={levelColor} radius="sm" {...other}>
      {workbookName}({date.slice(0, 4)})
    </Badge>
  )
}