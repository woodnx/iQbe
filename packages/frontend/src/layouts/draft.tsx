import { AppShell, Container } from "@mantine/core";
import { Outlet } from "@tanstack/react-router";

export default function LoginLayout() {
  return (
    <>
      <AppShell>
        <Container size="sm" mt={100}>
          <Outlet />
        </Container>
      </AppShell>
    </>
  );
}
