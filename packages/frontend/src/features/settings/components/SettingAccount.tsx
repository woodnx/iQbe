import { Button, Center } from "@mantine/core";
import { logoutUser } from "@/plugins/auth";

export default function SettingAccount() {
  return (
    <Center my="md">
      <Button radius="xl" onClick={() => logoutUser()}>
        ログアウト
      </Button>
    </Center>
  );
}
