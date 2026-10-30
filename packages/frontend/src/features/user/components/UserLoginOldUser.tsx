import { useReducer } from "react";
import { Button, Paper, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "@tanstack/react-router";
import { loginWithUsername } from "@/plugins/auth";

export function UserLoginModal() {
  const navigate = useNavigate();
  const [isOld, toggle] = useReducer((v) => !v, false);
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
      email: "",
      confirmPassword: "",
    },
  });

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await loginWithUsername(form.values.username, form.values.password).then(
        async (_user) => {
          if (_user == "please do re-registration") {
            toggle();
            form.setFieldValue("email", form.values.username);
            form.setFieldValue("username", "");
            return;
          }
          navigate({ to: "/" });
          form.reset();
        },
      );
    } catch {
      notifications.show({
        title: "Login Error",
        message: "No such user",
        color: "red",
        withBorder: true,
      });
    }
  };

  return (
    <Paper>
      <form onSubmit={submit}>
        <TextInput
          {...form.getInputProps("username")}
          placeholder={isOld ? "Username" : "Username or email"}
          label={isOld ? "Username" : "Username or Email"}
          radius="xl"
          size="md"
        />
        {isOld ? (
          <TextInput
            {...form.getInputProps("email")}
            placeholder="Email"
            label="Email"
            radius="xl"
            size="md"
          />
        ) : null}
        <PasswordInput
          {...form.getInputProps("password")}
          placeholder={isOld ? "New Password" : "Password"}
          label={isOld ? "New Password" : "Password"}
          radius="xl"
          size="md"
          mt="sm"
        />
        {isOld ? (
          <PasswordInput
            {...form.getInputProps("confirmPassword")}
            placeholder="Confirm Password"
            label="Confirm Password"
            radius="xl"
            size="md"
          />
        ) : null}
        <Button fullWidth type="submit" mt="lg">
          Login
        </Button>
      </form>
    </Paper>
  );
}
