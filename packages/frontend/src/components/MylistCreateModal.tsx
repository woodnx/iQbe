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
      title="マイリストの新規作成"
      centered
      zIndex={10000}
    >
      <TextInput 
        {...mylistNameProps}
      />
      <Group mt="sm" justify="right">
        <Button
          onClick={create}
        >新規作成</Button>
      </Group>
    </Modal>
  )
}