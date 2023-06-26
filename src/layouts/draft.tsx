import { AppShell } from "@mantine/core";
import { LayoutProps } from "./default";

export default function LoginLayout({ children }: LayoutProps) {
  return (
    <>
      <AppShell pt="125px" px="200px">
        {children}
      </AppShell>
    </>
  )
}