import { ActionIcon, Button, DefaultProps, Group, Modal, Selectors, Text, TextInput, createStyles } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPencil } from "@tabler/icons-react";
import { formInputProps, useIsMobile } from "../hooks";

const useStyles = createStyles((theme) => ({
  button: {
    ...theme.fn.focusStyles(),
    borderRadius: theme.radius.xl,
    backgroundColor: "#fff",
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
    },
  },
  mobileButton: {
    ...theme.fn.focusStyles(),
    backgroundColor: "#fff",
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
    },
  },
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
  const isMobile = useIsMobile();
  const icon = <IconPencil/>;
  // @ts-ignore
  const { classes } = useStyles({}, { name: 'MylistEditModal', classNames, styles, unstyled });

  const edit = () => {
    onSave();
    close();
  }

  const defaultButton = (
    <Button 
      className={classes.button}
      variant="outline" 
      radius="xl" 
      leftIcon={icon}
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
        title={<Text weight={500} size="xl">Edit Mylist</Text>}
        size={ isMobile ? 'xs' : 'md' }
        pos="absolute"
        left="-5%"
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
      { isMobile ? mobileButton : defaultButton }
    </>
  )
}