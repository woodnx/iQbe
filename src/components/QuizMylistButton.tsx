import { Button, Divider, Menu, createStyles } from "@mantine/core";
import { IconList, IconPlus } from "@tabler/icons-react";

const useStyle = createStyles((theme) => ({
  button: {
    ...theme.fn.focusStyles(),
    borderRadius: theme.radius.xl
  }
}))

export default function QuizMylistButton() {
  const { classes } = useStyle()
  return (
    <Menu 
      shadow="sm" 
      width={200} 
      position="bottom-end"
    >
      <Menu.Target>
        <Button
          classNames={{root: classes.button}}
          leftIcon={<IconList />}
          variant="outline"
          size="xs"
        >追加
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item icon={<IconList size={14}/>}>世界史</Menu.Item>
        <Divider/>
        <Menu.Item icon={<IconPlus size={14}/>}>マイリストを作成</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}