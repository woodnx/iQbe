import { Box, BoxProps, Grid,  Text } from "@mantine/core";
import { useWorkbooks } from "@/hooks/useWorkbooks";
import WorkbookCreateModalButton from "./WorkbookCreateModalButton";
import WorkbookSelector from "./WorkbookSelector";

interface Props extends BoxProps {
  value?: string | null,
  onChange?: (value: string | null) => void,
  disabled?: boolean,
}

export default function WorkbookCreateAndSelector({
  value,
  onChange = () => {},
  disabled,
  ...others
}: Props) {
  const { workbooks } = useWorkbooks();

  return (
    <Box {...others}>
      <Text fz="sm" mb={0} >問題集の設定</Text>
      <Grid>
        {
          (workbooks && workbooks?.length > 0) &&
          <Grid.Col pb={0}>
            <WorkbookSelector
              value={value}
              onChange={(v) => onChange(v)}
              disabled={disabled}
            />
          </Grid.Col>
        }
        { 
          !disabled && 
          <Grid.Col span={12}>
            <WorkbookCreateModalButton />
          </Grid.Col>
        }
      </Grid>
    </Box>
  );
}
