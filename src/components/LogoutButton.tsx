import { Button } from "@mantine/core";
import { getAuth, signOut } from "firebase/auth";

export default function LogoutButtom() {
  const auth = getAuth()
  return (
    <Button
      onClick={() => signOut(auth)}
    >
      Logout
    </Button>
  )
}