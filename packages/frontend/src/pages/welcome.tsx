import { signupUser } from "@/plugins/auth";
import { Button, Card, Center, getGradient, PasswordInput, TextInput, Title, useMantineTheme } from "@mantine/core";
import { useForm, isNotEmpty, matchesField } from '@mantine/form';
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";

interface SubmitValue {
  username: string,
  password: string,
}

export default function Welcome() {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      username: (value) => 
        !(/^[a-zA-Z0-9_]+$/.test(value)) 
        ? 'Can use a~z, A~Z, 0~9, _ for username'
        : null,
      password: isNotEmpty('Password is required'),
      confirmPassword: matchesField('password', 'Passwords are not the same'),
    },
    validateInputOnChange: true,
  });

  const submit = async (values: SubmitValue) => {
    try { 
      await signupUser(values.username, values.password)
      .then(async (_user) => {
        navigate('/');
      });
  
      form.reset();
    } catch {
      notifications.show({
        title: 'Signup Error',
        message: '',
        color: 'red',
        withBorder: true,
      });
    }
  };

  return (
    <>
      <Card shadow="xs" radius="lg">
        <Card.Section p="xl" inheritPadding bg={getGradient({ deg: 45, from: 'blue', to: 'cyan.7' }, theme)}>
          <Center>
            <Title c="#FFFFFF">
              Welcome to iQbe!!
            </Title>
          </Center>
        </Card.Section>
        <Card.Section m="lg">
          <Center>
            サーバの作成が完了しました！！管理用ユーザを作成しましょう！
          </Center>
          <form onSubmit={form.onSubmit(v => submit(v))}>
            <TextInput 
              {...form.getInputProps('username')}
              placeholder="Username"
              label="Username"
              radius="xl"
              size="md"
              mt="lg"
              inputWrapperOrder={['label', 'input', 'description', 'error']}
            >
            </TextInput>
            <PasswordInput
              {...form.getInputProps('password')}
              placeholder="Password"
              label="Password"
              radius="xl"
              size="md"
              mt="lg"
            />
            <PasswordInput
              {...form.getInputProps('confirmPassword')}
              placeholder="Confirm password"
              label="Confirm password"
              radius="xl"
              size="md"
              mt="lg"
            />
            <Button
              fullWidth 
              type="submit" 
              mt="xl"
              disabled={!form.isValid()}
            >
              Register
            </Button>
          </form>
        </Card.Section>
      </Card>
    </>
  )
}