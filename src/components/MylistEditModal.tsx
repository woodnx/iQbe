import { Button, DefaultProps, Group, Modal, Selectors, Text, TextInput, createStyles } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPencil } from "@tabler/icons-react";
import { formInputProps } from "../hooks";

const useStyles = createStyles((theme) => ({
  button: {
    ...theme.fn.focusStyles(),
    borderRadius: theme.radius.xl,
    backgroundColor: "#fff",
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
    },
  }
}));

type MylistEditModalStylesNames = Selectors<typeof useStyles>;

interface Props extends DefaultProps<MylistEditModalStylesNames> {
  newNameProps: formInputProps,
  onSave: () => void,
}

export default function MylistEditModal({
  classNames,
  styles,
  unstyled,
  newNameProps,
  onSave,
}: Props){
  const [ opened, { open, close } ] = useDisclosure();
  const icon = <IconPencil/>;
  // @ts-ignore
  const { classes } = useStyles({}, { name: 'MylistEditModal', classNames, styles, unstyled });

  const edit = () => {
    onSave();
    close();
  }

  return (
    <>
      <Modal 
        opened={opened} 
        onClose={close}
        title={<Text weight={500} size="xl">Edit Mylist</Text>}
        centered
      >
        <TextInput
          {...newNameProps}
        />
        <Group position="apart" mt="sm">
          <Button 
            variant="outline"
            color="dark"
            onClick={close}
          >Cancel</Button>
          <Button 
            onClick={edit}
            leftIcon={icon}
          >Save</Button>
        </Group>
      </Modal>
      <Button 
        className={classes.button}
        variant="outline" 
        radius="xl" 
        leftIcon={icon}
        onClick={open}
      >
        Edit
      </Button>
    </>
  )
}