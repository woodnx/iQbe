import { Button, Center, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { UserLoginModal } from '../components/UserLoginModal';
import Logo from "../components/Logo";
import { UserSignupModal } from "../components/UserSignupModal";
import { useLayoutEffect } from "react";
import { checkAuth } from "../plugins/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [ loginOpened, { open: loginOpen, close: loginClose } ] = useDisclosure(false);
  const [ signupOpened, { open: signupOpen, close: signupClose } ] = useDisclosure(false);
  const navigate = useNavigate();
  
  useLayoutEffect(() => {
    checkAuth().then(user => {
      if(!!user) {
        navigate('/');
        return;
      }
    });
  }, []);
  
  return (
    <Center>
      <Stack justify="center" w={500}>
        <Center>
          <Logo width={160} horizonal/>
        </Center>
        <Button onClick={loginOpen}>Login</Button>
        <Button onClick={signupOpen}>New Registration</Button>
      </Stack>
      <Modal opened={loginOpened} onClose={loginClose} title="Login" w={500}>
        <UserLoginModal />
      </Modal>
      <Modal opened={signupOpened} onClose={signupClose} title="New Registration">
        <UserSignupModal/>
      </Modal>
    </Center>
  );
}