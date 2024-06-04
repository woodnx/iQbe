import { useIsMobile } from '@/contexts/isMobile';
import { useInput } from '@/hooks';
import { ActionIcon, BoxProps, Button, Group, Modal, Text, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPencil } from '@tabler/icons-react';

import classes from './styles/MylistModal.module.css';

interface Props extends BoxProps {
  mylistName: string,
  onSave: (newName: string) => void,
}

export default function MylistEditModal({
  mylistName,
  onSave,
}: Props){
  const [ opened, { open, close } ] = useDisclosure();
  const [ newNameProps ] = useInput(mylistName || '');
  const isMobile = useIsMobile();
  const icon = <IconPencil/>;

  const edit = (newName: string) => {
    onSave(newName);
    close();
  }

  const defaultButton = (
    <Button 
      className={classes.button}
      variant="outline" 
      radius="xl" 
      leftSection={icon}
      onClick={open}
    >Edit</Button>
  );

  const mobileButton = (
    <ActionIcon
      className={classes.mobileButton}
      size="lg" 
      color="blue"
      variant="subtle"
      onClick={open}
    >
      { icon }
    </ActionIcon>
  );

  return (
    <>
      <Modal 
        opened={opened} 
        onClose={close}
        title={<Text fw={500} size="xl">Edit Mylist</Text>}
        size={ isMobile ? 'xs' : 'md' }
        centered
      >
        <TextInput
          {...newNameProps}
        />
        <Group justify="space-between" mt="sm">
          <Button 
            variant="outline"
            color="dark"
            onClick={close}
          >Cancel</Button>
          <Button 
            onClick={() => edit(newNameProps.value)}
            leftSection={icon}
          >Save</Button>
        </Group>
      </Modal>
      { isMobile ? mobileButton : defaultButton }
    </>
  )
}