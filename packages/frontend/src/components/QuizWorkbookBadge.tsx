import { Badge, BadgeProps } from "@mantine/core";
import { useIsMobile } from "@/contexts/isMobile";

interface Props extends BadgeProps {
  workbookName: string,
  levelColor: string,
  date?: string,
  transformUpper?: boolean,
}

export function QuizWorkbookBadge({
  workbookName,
  levelColor,
  date,
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
      sx={{ textTransform: 'none', backgroundColor: '#fff' }}
      {...other}
    >
      <div>{workbookName}{!!date ? `(${date.slice(0, 4)})` : null}</div>
    </Badge>
  )
}