import { useLoginedUser } from "@/hooks/useLoginedUser";
import { Avatar, Group, Text } from "@mantine/core";

export default function UserInfo() {
  const { i } = useLoginedUser();

  return (
    <Group wrap="nowrap">
      <Avatar size={60} src={`http://localhost:9000${i.photoURL}`} />
      <div>
        <Text fz="xl" fw="bold" lineClamp={1}>
          {i.nickname}
        </Text>
        <Text fz="sm" c="gray" lineClamp={1}>
          @{i.username}
        </Text>
      </div>
    </Group>
  );
}
