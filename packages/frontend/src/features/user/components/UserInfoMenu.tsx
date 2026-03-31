import { UnstyledButton } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import UserInfo from "./UserInfo";

export default function UserInfoMenu() {
  const navigate = useNavigate();

  return (
    <UnstyledButton onClick={() => navigate({ to: "/setting" })}>
      <UserInfo />
    </UnstyledButton>
  );
}
