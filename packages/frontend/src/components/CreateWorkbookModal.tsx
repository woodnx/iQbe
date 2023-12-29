import { useIsMobile } from "@/contexts/isMobile"
import { useWorkbooks } from "@/hooks/useWorkbooks";
import axios from "@/plugins/axios";
import { WorkbooksData } from "@/types";
import { ActionIcon, Button, Group, Modal, TextInput } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { IconSquarePlus2 } from "@tabler/icons-react";
import { useState } from "react";

export default function CreateWorkbookModal() {
  const [ listName, setListName ] = useState('');
  const [ opened, { open, close }] = useDisclosure();
  const { mutate } = useWorkbooks();
  const isMobile = useIsMobile();
  const Icon = () => <IconSquarePlus2/>;
  const ResponsiveButton = () => (
    isMobile
    ?
    <ActionIcon onClick={open} variant="light" color="primary">
      <Icon/>
    </ActionIcon>
    :
    <Button leftIcon={<Icon/>} onClick={open}>
      New Quiz List
    </Button>
  );

  const create = async () => {
    const allList = await axios.post<WorkbooksData[]>('/workbooks/new', {
      listName,
    }).then(res => res.data);
    mutate(allList);
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
        <Group position="right" mt="md">
          <Button onClick={() => create()}>
            Create
          </Button>
        </Group>
      </Modal>
    </>
  )
}