import { Badge, BadgeProps } from "@mantine/core";
import { useIsMobile } from "@/contexts/isMobile";
import { $api } from "@/utils/client";

interface Props extends BadgeProps {
  wid: string,
  levelColor: string,
  transformUpper?: boolean,
}

export function QuizWorkbookBadge({
  wid,
  levelColor,
  transformUpper,
  ...other
}: Props) {
  const isMobile = useIsMobile();
  const { data: workbook } = $api.useQuery('get', '/workbooks/{wid}', {
    params: { path: { wid } },
  })

  return (
    <Badge 
      variant="dot"
      color={levelColor} 
      radius="sm"
      size={ isMobile ? "md" : "lg" }
      style={{ textTransform: 'none', backgroundColor: '#fff' }}
      {...other}
    >
      <div>{workbook?.name}{!!workbook?.date ? `(${workbook?.date.slice(0, 4)})` : null}</div>
    </Badge>
  )
}