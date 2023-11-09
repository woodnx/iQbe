import { useNavigate } from "react-router-dom";
import { Button, Center, Paper, PasswordInput, TextInput } from "@mantine/core";
import { useInput } from "../hooks";
import { notifications } from "@mantine/notifications";
import { loginWithUsername } from "../plugins/auth";

export function UserLoginModal() {
  const [ passwordProps, resetPassword ] = useInput('');
  const [ usernameProps, resetUsername ] = useInput('');
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try { 
      await loginWithUsername(usernameProps.value, passwordProps.value)
      .then(async (_user) => {
        navigate('/');
      });
  
      resetPassword();
      resetUsername();
    } catch {
      notifications.show({
        title: 'Login Error',
        message: 'No such user',
        color: 'red',
        withBorder: true,
      });
    }
  };

  return (
    <Paper>
      <Center>
        <form onSubmit={submit}>
          <TextInput 
            {...usernameProps}
            placeholder="Your username"
            label="Username"
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
      </Center>
    </Paper>
  );
}