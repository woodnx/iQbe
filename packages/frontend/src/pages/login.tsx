import { useLayoutEffect } from "react";
import { Button, Center, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { UserLoginModal } from "@/features/user/components/UserLoginModal";
import Logo from "@/shared/components/Logo";
import { UserSignupModal } from "@/features/user/components/UserSignupModal";
import { checkAuth } from "@/plugins/auth";
import { useNavigate } from "@tanstack/react-router";

export default function Login() {
  const [loginOpened, { open: loginOpen, close: loginClose }] =
    useDisclosure(false);
  const [signupOpened, { open: signupOpen, close: signupClose }] =
    useDisclosure(false);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    checkAuth().then((user) => {
      if (!!user) {
        navigate({ to: "/" });
        return;
      }
    });
  }, []);

  return (
    <Center>
      <Stack justify="center" w={500}>
        <Center>
          <Logo width={160} horizonal />
        </Center>
        <Button onClick={loginOpen}>Login</Button>
        <Button onClick={signupOpen}>New Registration</Button>
      </Stack>
      <Modal opened={loginOpened} onClose={loginClose} title="Login" w={500}>
        <UserLoginModal />
      </Modal>
      <Modal
        opened={signupOpened}
        onClose={signupClose}
        title="New Registration"
      >
        <UserSignupModal />
      </Modal>
    </Center>
  );
}
