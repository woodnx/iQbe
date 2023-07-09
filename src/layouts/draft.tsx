import { AppShell } from "@mantine/core";
import { Outlet } from "react-router-dom";

export default function LoginLayout() {
  return (
    <>
      <AppShell pt="125px" px="200px">
        <Outlet/>
      </AppShell>
    </>
  )
}