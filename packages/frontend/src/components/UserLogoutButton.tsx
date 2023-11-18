import { Button } from "@mantine/core";
import { logoutUser } from "@/plugins/auth";

export default function LogoutButton() {
  return (
    <Button
      fullWidth
      uppercase
      onClick={() => logoutUser()}
    >
      Logout
    </Button>
  )
}