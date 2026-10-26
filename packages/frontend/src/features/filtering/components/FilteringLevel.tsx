import { useQuery } from "@tanstack/react-query";
import { BoxProps, Checkbox, Group } from "@mantine/core";
import { api } from "@/utils/api";

interface FilteringLevelProps extends BoxProps {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
}

export interface Level {
  id: number;
  name: string;
  color: string;
}

export default function FilteringLevel({
  value,
  onChange,
  ...others
}: FilteringLevelProps) {
  const { data: levels } = useQuery({
    queryKey: ["get", "/levels"],
    queryFn: ({ signal }) => api.getLevels({}, signal),
  });

  return (
    <Checkbox.Group
      value={value}
      onChange={onChange}
      label="Select Workbook's Level"
      {...others}
    >
      <Group>
        {levels?.map((level) => (
          <Checkbox
            value={level.id.toString()}
            label={level.name}
            color={level.color}
            key={level.id}
          />
        ))}
      </Group>
    </Checkbox.Group>
  );
}
