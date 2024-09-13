import { Box, BoxProps, Grid,  Text } from "@mantine/core";
import { useWorkbooks } from "@/hooks/useWorkbooks";
import WorkbookCreateModalButton from "./WorkbookCreateModalButton";
import WorkbookSelector from "./WorkbookSelector";

interface Props extends BoxProps {
  value?: string | null,
  onChange?: (value: string | null) => void,
}

export default function WorkbookCreateAndSelector({
  value,
  onChange = () => {},
  ...others
}: Props) {
  const { workbooks } = useWorkbooks();

  return (
    <Box {...others}>
      <Text fz="sm" mb={0}>問題集の設定</Text>
      <Grid m={0} p={0}>
        {
          (workbooks && workbooks?.length > 0) &&
          <Grid.Col pb="xs">
            <WorkbookSelector
              value={value}
              onChange={(v) => onChange(v)}
            />
          </Grid.Col>
        }
        <Grid.Col span={12} my={0} py={0}>
          <WorkbookCreateModalButton />
        </Grid.Col>
      </Grid>
    </Box>
  );
}
