import { BoxProps, Checkbox, Group } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { readResponse, rpc } from "@/utils/client";

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
    queryFn: ({ signal }) =>
      rpc.api.levels.$get({}, { init: { signal: signal } }).then(readResponse),
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
