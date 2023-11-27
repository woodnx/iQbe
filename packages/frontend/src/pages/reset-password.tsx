import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Center, PasswordInput, Stack, TextInput, Title } from "@mantine/core";
import { isNotEmpty, matchesField, useForm } from "@mantine/form";
import axios from "@/plugins/axios";
import { useSetRequestResetPassword } from "@/contexts/requestResetPassword";

interface SubmitValue {
  username: string,
  newPassword: string,
}

export default function ResetPassword() {
  const [ searchParams ] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const setRequesting = useSetRequestResetPassword();
  const form = useForm({
    initialValues: {
      username: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    validate: {
      newPassword: isNotEmpty('Password is required'),
      confirmNewPassword: matchesField('newPassword', 'Passwords are not the same'),
    }
  });

  const submit = async (v: SubmitValue) => {
    const message = await axios.post('/reset-password', {
      token,
      newPassword: v.newPassword,
    }).then(res => res.data);

    if (message == 'succeed reset password') {
      localStorage.setItem('uid', '');
      localStorage.setItem('accessToken', '');
      localStorage.setItem('refreshToken', '');
      navigate('/');
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/');
      setRequesting(true);
    }
  }, []);

  return (
    <Center>
      <Stack justify="center" w={500}>
        <Title>Password Reset Form</Title>
        <form onSubmit={form.onSubmit((v) => submit(v))}>
          <TextInput 
            {...form.getInputProps('username')}
            placeholder="Username"
            label="Username"
            radius="xl"
            size="md"
            inputWrapperOrder={['label', 'input', 'description', 'error']}
          />
          <PasswordInput
            {...form.getInputProps('newPassword')}
            placeholder="New password"
            label="New password"
            radius="xl"
            size="md"
            mt="sm"
          />
          <PasswordInput
            {...form.getInputProps('confirmNewPassword')}
            placeholder="Confirm password"
            label="Confirm password"
            radius="xl"
            size="md"
            mt="sm"
          />
          <Button 
            fullWidth 
            type="submit" 
            mt="lg"
            disabled={!form.isValid()}
          >
            Register
          </Button>
        </form>
      </Stack>
    </Center>
  );
}