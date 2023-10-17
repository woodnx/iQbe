import { Button } from "@mantine/core";
import { signOut } from "firebase/auth";
import { auth } from "../plugins/firebase";

export default function LogoutButton() {
  return (
    <Button
      fullWidth
      uppercase
      onClick={() => signOut(auth)}
    >
      Logout
    </Button>
  )
}