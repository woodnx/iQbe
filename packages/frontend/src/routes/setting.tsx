import { Container, Tabs, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import SettingAccount from "@/features/settings/components/SettingAccount";
import SettingProfile from "@/features/settings/components/SettingProfile";
import SettingServer from "@/features/settings/components/SettingServer";
import { useIsSuperUser } from "@/hooks/useLoginedUser";

export const Route = createFileRoute("/setting")({
  component: RouteComponent,
});

function RouteComponent() {
  const isSuperUser = useIsSuperUser();

  return (
    <Container size="md">
      <Title>設定</Title>

      <Tabs mt="lg" defaultValue="profile">
        <Tabs.List grow>
          <Tabs.Tab value="profile">プロフィール</Tabs.Tab>
          <Tabs.Tab value="account">アカウント</Tabs.Tab>
          {isSuperUser && <Tabs.Tab value="server">サーバ</Tabs.Tab>}
        </Tabs.List>

        <Tabs.Panel value="profile">
          <SettingProfile />
        </Tabs.Panel>

        <Tabs.Panel value="account">
          <SettingAccount />
        </Tabs.Panel>

        <Tabs.Panel value="server">
          <SettingServer />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
