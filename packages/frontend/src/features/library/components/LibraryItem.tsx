import { Group, RingProgress, Text, Tooltip } from "@mantine/core";

export type LibraryItemProps = {
  name: string;
  total: number;
  corrects: number;
  wrongs: number;
  skips: number;
};

export function LibraryItem({
  name,
  total,
  corrects,
  wrongs,
  skips,
}: LibraryItemProps) {
  const answered = corrects + wrongs + skips;
  const correctsRate = (corrects / total) * 100;
  const wrongsRate = (wrongs / total) * 100;
  const skipsRate = (skips / total) * 100;

  return (
    <Group justify="space-between" wrap="nowrap">
      <Group gap="xs" wrap="nowrap">
        <div
          style={{
            width: "4px",
            backgroundColor: "#a5d8ff",
            alignSelf: "stretch",
            borderRadius: "12px",
            flexShrink: 0,
          }}
        ></div>
        <div>
          <Text fw={700} size="lg" lineClamp={1} component="div">
            {name}
          </Text>
          <Text c="dimmed" size="sm">
            {answered} / {total}問 解答済み
          </Text>
        </div>
      </Group>
      <Tooltip label={`正答: ${corrects}, 誤答: ${wrongs}, スルー: ${skips}`}>
        <RingProgress
          size={50}
          thickness={6}
          roundCaps
          sections={[
            { value: correctsRate, color: "red.6" },
            { value: wrongsRate, color: "blue.6" },
            { value: skipsRate, color: "gray.8" },
          ]}
          mr="sm"
        />
      </Tooltip>
    </Group>
  );
}
