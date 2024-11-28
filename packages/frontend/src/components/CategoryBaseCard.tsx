import { Badge, Group, Paper, PaperProps, Stack, Text } from "@mantine/core";

interface CategoryBaseCardProps extends PaperProps {
  name: string,
  description?: string,
  disabled: boolean,
}

export default function CategoryBaseCard({
  name,
  description,
  disabled,
  ...other
}: CategoryBaseCardProps) {
  return (
    <Paper {...other}>
      <Group wrap="nowrap">
        <Stack gap={0}>
          <Text lineClamp={1}>{ name }</Text>
          <Text 
            c="dimmed" size="sm" 
            lineClamp={1}
          >{ description }</Text>
        </Stack>
        { disabled && <Badge color="gray">無効</Badge>}
      </Group>
    </Paper>
  )
}