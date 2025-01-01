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

  const createWorkbook = async (name: string, published?: Date) => {
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
      <Modal 
        centered 
        title="問題集の新規作成" 
        zIndex={100}
        opened={creating} 
        onClose={create.close} 
      >
        <WorkbookCreateForm
          onSubmit={createWorkbook}
          onClose={create.close}
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