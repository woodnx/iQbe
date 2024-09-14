import { BoxProps, Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { $api } from "@/utils/client";
import WorkbookCreateForm from "./WorkbookCreateForm";
import { IconPlus } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";

interface Props extends BoxProps {
}

export default function WorkbookCreateModalButton({
}: Props) {
  const [ creating, create ] = useDisclosure(false);
  const { mutateAsync } = $api.useMutation("post", "/workbooks");
  const queryClient = useQueryClient();

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
          zIndex={100}
        />
      </Modal>
      <Button 
        variant="outline"
        leftSection={<IconPlus />}
        onClick={create.open}
      >問題集の新規作成</Button>
    </>
  );
}