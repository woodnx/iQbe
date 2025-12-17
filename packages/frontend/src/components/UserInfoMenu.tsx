import { Menu, rem, UnstyledButton } from "@mantine/core";
import UserInfo from "./UserInfo";
import { IconLogout, IconSettings } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { logoutUser } from "@/plugins/auth";

export default function UserInfoMenu() {
  const navigate = useNavigate();

  return (
    <Menu width="230px" position="top">
      <Menu.Target>
        <UnstyledButton>
          <UserInfo />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={
            <IconSettings style={{ width: rem(14), height: rem(14) }} />
          }
          onClick={() => navigate({ to: "/setting" })}
        >
          ユーザ設定
        </Menu.Item>

        <Menu.Item
          leftSection={
            <IconLogout style={{ width: rem(14), height: rem(14) }} />
          }
          onClick={logoutUser}
        >
          ログアウト
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
