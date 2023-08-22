import { Button, Group, Modal, ModalProps, TextInput } from "@mantine/core";
import { useInput } from "../hooks";

interface Props extends ModalProps {
  onCreate?: (mylistName: string) => void,
}

export default function MylistCreateModal({
  opened,
  onClose,
  onCreate = () => {},
}: Props) {
  const [ mylistNameProps, Reset ] = useInput('');

  const create = () => {
    onCreate(mylistNameProps.value);
    onClose();
    Reset();
  }

  return (
    <Modal opened={opened} onClose={onClose}>
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