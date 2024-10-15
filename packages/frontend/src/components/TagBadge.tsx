import { chooseTextColor, hexToRgb } from "@/utils/rgb";
import { Badge } from "@mantine/core";

export interface TagBadgeProps {
  label: string,
  color: string
}

export default function TagBadge({
  label,
  color,
}: TagBadgeProps) {
  const [red, blue, green] = hexToRgb(color);
  const textColor = chooseTextColor(red, blue, green);

  return (
    <Badge 
      color={color} 
      size="lg"
      styles={{
        root: {
          textTransform: 'none',
        },
        label: {
          color: textColor,
        }
      }}
    >
      { label }
    </Badge>
  );
}