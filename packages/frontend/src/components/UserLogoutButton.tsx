import { Button } from "@mantine/core";
import { logoutUser } from "@/plugins/auth";

export default function LogoutButton() {
  return (
    <Button td="uppercase" fullWidth onClick={() => logoutUser()}>
      Logout
    </Button>
  );
}
