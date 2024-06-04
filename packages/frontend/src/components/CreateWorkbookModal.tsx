import { useState } from "react";
import { ActionIcon, Button, Group, Modal, TextInput } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { IconSquarePlus2 } from "@tabler/icons-react";
import api from "@/plugins/api";
import { useIsMobile } from "@/contexts/isMobile"
import { useWorkbooks } from "@/hooks/useWorkbooks";

export default function CreateWorkbookModal() {
  const [ listName, setListName ] = useState('');
  const [ opened, { open, close }] = useDisclosure();
  const { workbooks, mutate } = useWorkbooks(true);
  const isMobile = useIsMobile();
  const Icon = () => <IconSquarePlus2/>;
  const ResponsiveButton = () => (
    isMobile
    ?
    <ActionIcon onClick={open} variant="light" color="primary">
      <Icon/>
    </ActionIcon>
    :
    <Button leftSection={<Icon/>} onClick={open}>
      New Quiz List
    </Button>
  );

  const create = async () => {
    const body = {
      workbookName: listName,
    };
    const created = (await api.workbooks.post({ body })).body;
    const newList = [ ...workbooks || [], created ];
    
    mutate(newList);
    close();
  }

  return (
    <>
      <ResponsiveButton/>
      <Modal 
        opened={opened} 
        onClose={close}
        title="Create New Quiz List"
        centered
      >
        <TextInput
          value={listName}
          onChange={(e) => setListName(e.currentTarget.value)}
          placeholder="New List Name"
        />
        <Group justify="right" mt="md">
          <Button onClick={() => create()}>
            Create
          </Button>
        </Group>
      </Modal>
    </>
  )
}