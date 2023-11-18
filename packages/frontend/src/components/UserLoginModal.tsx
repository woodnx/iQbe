import { useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Paper, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { loginOldUser, loginWithUsername } from "@/plugins/auth";

interface SubmitValue {
  username: string,
  password: string
}

interface OldSubmitValue {
  username: string,
  password: string,
  email: string,
}

export function UserLoginModal() {
  const navigate = useNavigate();
  const [ isOld, toggle ]  = useReducer(v => !v, false);
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      email: '',
      confirmPassword: '',
    }
  })

  const submit = async (values: SubmitValue) => {
    try { 
      await loginWithUsername(values.username, values.password)
      .then(async (_user) => {
        if (_user == 'please do re-registration') {
          toggle();
          const email = form.values.username;
          form.reset();
          form.setFieldValue('email', email);
          return;
        }
        navigate('/');
        form.reset();
      });
    } catch {
      notifications.show({
        title: 'Login Error',
        message: 'No such user',
        color: 'red',
        withBorder: true,
      });
    }
  };

  const isOldSubmit = async (values: OldSubmitValue) => {
    try { 
      await loginOldUser(values.username, values.email, values.password)
      .then(async (_user) => {
        navigate('/');
        form.reset();
      });
    } catch {
      notifications.show({
        title: 'Login Error',
        message: 'Faild Registering',
        color: 'red',
        withBorder: true,
      });
    }
  }

  return (
    <Paper>
      <form onSubmit={form.onSubmit(v => isOld ? isOldSubmit(v) : submit(v))}>
        <TextInput 
          {...form.getInputProps('username')}
          placeholder={isOld ? 'Username' : 'Username or email'}
          label={isOld ? 'Username' : 'Username or Email'}
          radius="xl"
          size="md"
        />
        {
          isOld ? 
          <TextInput
            {...form.getInputProps('email')}
            placeholder="Email"
            label="Email"
            radius="xl"
            size="md"
          />
          : null
        }
        <PasswordInput
          {...form.getInputProps('password')}
          placeholder={isOld ? 'New Password' : 'Password'}
          label={isOld ? 'New Password' : 'Password'}
          radius="xl"
          size="md"
          mt="sm"
        />
        {
          isOld ? 
          <PasswordInput
            {...form.getInputProps('confirmPassword')}
            placeholder="Confirm Password"
            label="Confirm Password"
            radius="xl"
            size="md"
          />
          : null
        }
        <Button 
          fullWidth 
          type="submit" 
          mt="lg"
        >
          Login
        </Button>
      </form>
    </Paper>
  );
}