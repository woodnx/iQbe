import { BoxProps, Button, Grid, Modal, Select, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { $api } from "@/utils/client";
import WorkbookCreateForm from "./WorkbookCreateForm";
import { useWorkbooks } from "@/hooks/useWorkbooks";
import { IconPlus } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";

interface Props extends BoxProps {
  value?: string | null,
  onChange?: (value: string | null) => void,
}

export default function WorkbookSelector({
  value,
  onChange = () => {},
  ...others
}: Props) {
  const [ creating, create ] = useDisclosure(false);
  const { mutateAsync } = $api.useMutation("post", "/workbooks");
  const { workbooks } = useWorkbooks();
  const queryClient = useQueryClient();

  const data = workbooks?.map(w => ({ ...w, value: w.wid, label: w.name}));

  const createWorkbook = async (name: string, published: Date | null) => {
    try {
      await mutateAsync({body: {
        name,
        published,
      }});
      queryClient.invalidateQueries();
    } catch(e) {
      return;
    }
    create.close();
  };

  return (
    <>
      <Modal opened={creating} onClose={create.close} title="問題集の新規作成" centered>
        <WorkbookCreateForm
          opened={creating}
          onClose={create.close}
          onCreate={createWorkbook}
          zIndex={50}
        />
      </Modal>
      <Text fz="sm" mb="xs">問題集の設定</Text>
      <Grid {...others}>
        {
          (workbooks && workbooks?.length > 0) &&
          <Grid.Col span={4}>
            <Select
              clearable
              placeholder="問題集を選択"
              data={data}
              value={value}
              onChange={(v) => onChange(v)}
            />
          </Grid.Col>
        }
        <Grid.Col span={12}>
          <Button 
            variant="outline"
            leftSection={<IconPlus />}
            onClick={create.open}
          >問題集の新規作成</Button>
        </Grid.Col>
      </Grid>
    </>
  );
}