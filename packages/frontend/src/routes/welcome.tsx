import {
  Button,
  Card,
  Center,
  getGradient,
  PasswordInput,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { isNotEmpty, matchesField, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { signupUser } from "@/plugins/auth";

export const Route = createFileRoute("/welcome")({
  component: RouteComponent,
});

interface SubmitValue {
  username: string;
  password: string;
}

function RouteComponent() {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      username: (value) =>
        !/^[a-zA-Z0-9_]+$/.test(value)
          ? "Can use a~z, A~Z, 0~9, _ for username"
          : null,
      password: isNotEmpty("Password is required"),
      confirmPassword: matchesField("password", "Passwords are not the same"),
    },
    validateInputOnChange: true,
  });

  const submit = async (values: SubmitValue) => {
    try {
      await signupUser(values.username, values.password).then(async (_user) => {
        navigate({ to: "/" });
      });

      form.reset();
    } catch {
      notifications.show({
        title: "Signup Error",
        message: "",
        color: "red",
        withBorder: true,
      });
    }
  };

  return (
    <>
      <Card radius="lg">
        <Card.Section
          p="xl"
          inheritPadding
          bg={getGradient({ deg: 45, from: "blue", to: "cyan.7" }, theme)}
        >
          <Center>
            <Title c="#FFFFFF">Welcome to iQbe!!</Title>
          </Center>
        </Card.Section>
        <Card.Section m="lg">
          <Center>
            サーバの作成が完了しました！！管理用ユーザを作成しましょう！
          </Center>
          <form onSubmit={form.onSubmit((v) => submit(v))}>
            <TextInput
              {...form.getInputProps("username")}
              placeholder="ユーザ名"
              label="ユーザ名"
              radius="xl"
              size="md"
              mt="lg"
              inputWrapperOrder={["label", "input", "description", "error"]}
            ></TextInput>
            <PasswordInput
              {...form.getInputProps("password")}
              placeholder="パスワード"
              label="パスワード"
              radius="xl"
              size="md"
              mt="lg"
            />
            <PasswordInput
              {...form.getInputProps("confirmPassword")}
              placeholder="パスワード（確認用）"
              label="パスワード（確認用）"
              radius="xl"
              size="md"
              mt="lg"
            />
            <Button fullWidth type="submit" mt="xl" disabled={!form.isValid()}>
              登録
            </Button>
          </form>
        </Card.Section>
      </Card>
    </>
  );
}
