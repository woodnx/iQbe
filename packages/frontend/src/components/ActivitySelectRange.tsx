import { Button, DefaultProps, Menu } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { Period } from "@/plugins/dayjs";

interface Props extends DefaultProps {
  period: Period,
  onClick: (period: Period) => void,
}

export default function ActivitySelectRange({
  period,
  onClick,
}: Props) {
  const items: Period[] = [
    'day',
    'week',
    'month',
  ]

  return (
    <Menu>
      <Menu.Target>
        <Button
          uppercase
          radius="xl"
          variant="outline"
          color="dark"
          rightIcon={<IconChevronDown/>}
        >
          { period }
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {
          items.map((i, idx) => 
          <Menu.Item onClick={() => onClick(i)} key={idx}>
            {i}
          </Menu.Item>)
        }
      </Menu.Dropdown>
    </Menu>
  )
}