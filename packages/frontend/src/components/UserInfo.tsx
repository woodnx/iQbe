import { $api } from "@/utils/client";
import { Avatar, Group, Text } from "@mantine/core";

export default function UserInfo() {
  const { data } = $api.useQuery('get', '/i');

  return (
    <Group wrap="nowrap">
      <Avatar
        size={60}
      />
      <div>
        <Text fz="xl" fw="bold" lineClamp={1}>{data?.nickname}</Text>
        <Text fz="sm" c="gray"  lineClamp={1}>@{data?.username}</Text>
      </div>
    </Group>
  );
}