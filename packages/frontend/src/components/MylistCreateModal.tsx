import { Button, Group, Modal, ModalProps, TextInput } from "@mantine/core";
import { useInput } from "@/hooks";
import { useIsMobile } from "@/contexts/isMobile";

interface Props extends ModalProps {
  onCreate?: (mylistName: string) => void,
}

export default function MylistCreateModal({
  opened,
  onClose,
  onCreate = () => {},
}: Props) {
  const [ mylistNameProps, Reset ] = useInput('');
  const isMobile = useIsMobile();

  const create = () => {
    onCreate(mylistNameProps.value);
    onClose();
    Reset();
  }

  return (
    <Modal 
      opened={opened} 
      onClose={onClose}
      size={ isMobile ? 'xs' : 'md' }
      pos="absolute"
      centered
      zIndex={10000}
    >
      <TextInput 
        label="Mylist name"
        {...mylistNameProps}
      />
      <Group mt="xl" position="right">
        <Button
          onClick={create}
        >Create</Button>
      </Group>
    </Modal>
  )
}