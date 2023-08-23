import { Button, DefaultProps, Group, Modal, Selectors, Text, createStyles } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";

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

type MylistDeleteModalStyleNames = Selectors<typeof useStyles>;

interface Props extends DefaultProps<MylistDeleteModalStyleNames> {
  onDelete: () => void,
}

export default function MylistDeleteModal({
  classNames,
  styles,
  unstyled,
  onDelete,
}: Props){
  const [ opened, { open, close } ] = useDisclosure();
  const icon = <IconTrash/>;
  // @ts-ignore
  const { classes } = useStyles({}, { name: 'MylistDeleteModal', classNames, styles, unstyled });

  const del = () => {
    onDelete();
    close();
  }

  return (
    <>
      <Modal 
        opened={opened} 
        onClose={close}
        title={<Text weight={500} size="xl">Delete Mylist</Text>}
        centered
      >
        <Text>マイリストを削除しますか？</Text>
        <Text c="red" size="sm">※この変更は元に戻せません。</Text>
        <Group position="apart" mt="sm">
          <Button 
            variant="outline"
            color="dark"
            onClick={close}
          >Cancel</Button>
          <Button 
            color="red"
            onClick={del}
            leftIcon={icon}
          >Delete</Button>
        </Group>
      </Modal>
      <Button 
        className={classes.button}
        variant="outline" 
        radius="xl" 
        leftIcon={icon}
        onClick={open}
      >
        Delete
      </Button>
    </>
  )
}