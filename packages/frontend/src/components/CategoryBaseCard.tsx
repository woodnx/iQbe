import { Paper, PaperProps, Text } from "@mantine/core";

interface CategoryBaseCardProps extends PaperProps {
  name: string,
  description?: string,
}

export default function CategoryBaseCard({
  name,
  description,
  ...other
}: CategoryBaseCardProps) {
  return (
    <Paper {...other}>
      <Text lineClamp={1}>{ name }</Text>
      <Text 
        c="dimmed" size="sm" 
        lineClamp={1}
      >{ description }</Text>
    </Paper>
  )
}