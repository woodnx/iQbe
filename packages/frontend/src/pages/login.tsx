import { useNavigate } from "react-router-dom";
import { auth } from "../plugins/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button, Center, Grid, Paper, PasswordInput, TextInput } from "@mantine/core";
import { useInput } from "../hooks";
import Logo from "../components/Logo";
import { notifications } from "@mantine/notifications";
import { useIsMobile } from "../contexts/isMobile";

export default function Login() {
  const [ passwordProps, resetPassword ] = useInput('');
  const [ emailProps, resetEmail ] = useInput('');
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try { 
      await signInWithEmailAndPassword(auth, String(emailProps.value), String(passwordProps.value))
      .then(async (_userCredential) => {
        navigate('/');
      });
  
      resetPassword();
      resetEmail();
    } catch {
      notifications.show({
        title: 'Login Error',
        message: 'Wrong e-mail or password',
        color: 'red',
        withBorder: true,
      });
    }
  };

  return (
    <Paper shadow="md" p="35px" radius="lg">
      <Grid>
        <Grid.Col span={isMobile ? 12 : 4}>
          <Center>
            <Logo width={160} />
          </Center> 
        </Grid.Col>
        <Grid.Col span={isMobile ? 12 : 8}>
          <form onSubmit={submit}>
            <TextInput 
              {...emailProps}
              placeholder="Your Email"
              label="Email"
              radius="xl"
              size="md"
            />
            <PasswordInput
              {...passwordProps}
              placeholder="Your Password"
              label="Password"
              radius="xl"
              size="md"
              mt="sm"
            />
            <Button 
              fullWidth 
              type="submit" 
              mt="lg"
            >
              Login
            </Button>
          </form>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}