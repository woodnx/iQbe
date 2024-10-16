import { colorSwatches } from "@/utils/tagColorSwatches";
import { Box, BoxProps, Button, ColorInput, Grid, Group, TextInput } from "@mantine/core"

export interface TagEditFormProps extends BoxProps {
  label: string,
  description: string,
  color: string,
  buttonLabel?: string,
  onChangeLabel?: (label: string) => void,
  onChangeDescription?: (description: string) => void,
  onChangeColor?: (color: string) => void,
  onSave?: (
    label: string,
    description: string,
    color: string,
  ) => void,
  onCancel?: () => void,
}

export default function TagEditForm({
  label,
  description,
  color,
  buttonLabel = '更新',
  onChangeLabel = () => {},
  onChangeDescription = () => {},
  onChangeColor = () => {},
  onSave = () => {},
  onCancel = () => {},
  ...others
}: TagEditFormProps) {

  return (
    <Box {...others}>
      <Grid>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <TextInput 
            label="タグの名前"
            withAsterisk
            value={label}
            defaultValue={label}
            onChange={(event) => onChangeLabel(event.currentTarget.value)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput 
            label="タグの説明"
            value={description}
            onChange={(event) => onChangeDescription(event.currentTarget.value)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <ColorInput 
            label="タグのカラー"
            format="hex"
            swatches={colorSwatches}
            value={color}
            defaultValue={color}
            onChange={onChangeColor}
          />
        </Grid.Col>
      </Grid>

      <Group justify="flex-end" mt="sm">
        <Button
          variant="outline"
          color="gray"
          onClick={onCancel}
        >
          キャンセル
        </Button>
        <Button
          onClick={() => onSave(label, description, color)}
        >
          { buttonLabel }
        </Button>
      </Group>
    </Box>
  )
}