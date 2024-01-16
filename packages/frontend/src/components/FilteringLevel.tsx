import useSWR from "swr";
import { BoxProps, Checkbox, Group } from "@mantine/core";
import { fetcher } from "@/fetchers";

interface FilteringLevelProps extends BoxProps {
  value: string[] | undefined,
  onChange: (value: string[]) => void,
}

export interface Level {
  id: number,
  name: string,
  color: string,
}

export default function FilteringLevel({ 
  value, 
  onChange,
  ...others
}: FilteringLevelProps) {
  const { data: levels } = useSWR<Level[]>('/levels', fetcher)

  return (
    <Checkbox.Group
      value={value}
      onChange={onChange}
      label="Select Workbook's Level"
      {...others}
    >
      <Group>
        {levels?.map(level => 
          <Checkbox 
            value={level.id.toString()} 
            label={level.name}
            color={level.color}
            key={level.id}
          />
        )}
      </Group>
    </Checkbox.Group>
  )
}