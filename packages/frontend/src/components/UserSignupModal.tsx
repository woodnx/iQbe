import { useEffect, useState } from "react";
import {
  Button,
  Flex,
  Paper,
  PasswordInput,
  Space,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm, isNotEmpty, matchesField, isEmail } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { signupUser } from "@/plugins/auth";
import { $api } from "@/utils/client";
import UsernameInput from "./UsernameInput";

interface SubmitValue {
  username: string;
  password: string;
  inviteCode?: string;
}

const requiredInviteCode =
  import.meta.env.VITE_REQUIRED_INVITE_CODE !== "false" ? true : false;

export function UserSignupModal() {
  const { mutate } = $api.useMutation("post", "/auth/available");
  const [available, setAvailable] = useState(false);
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
      email: "",
      confirmPassword: "",
      inviteCode: "",
    },
    validate: {
      username: (value) =>
        !/^[a-zA-Z0-9_]+$/.test(value)
          ? "Can use a~z, A~Z, 0~9, _ for username"
          : !available
            ? ""
            : null,
      email: isEmail("Invalid email"),
      password: isNotEmpty("Password is required"),
      confirmPassword: matchesField("password", "Passwords are not the same"),
    },
    validateInputOnChange: true,
  });

  useEffect(() => {
    mutate(
      { body: { username: form.values.username } },
      {
        onSuccess({ available }) {
          setAvailable(!!available);
          if (!available && form.values.username.length > 0)
            form.setFieldError("username", errormes);
        },
      },
    );
  }, [form.values.username]);

  const errormes = (
    <>
      <Flex align="center">
        <IconAlertTriangle size={14} />
        <Space w={5} />
        <Text span>This name is already in use</Text>
      </Flex>
    </>
  );

  const submit = async (values: SubmitValue) => {
    try {
      await signupUser(
        values.username,
        values.password,
        values.inviteCode,
      ).then(async (_user) => {
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
    <Paper>
      <form onSubmit={form.onSubmit((v) => submit(v))}>
        <UsernameInput
          {...form.getInputProps("username")}
          isValid={form.isValid("username")}
          placeholder="Username"
          label="Username"
          radius="xl"
          size="md"
          inputWrapperOrder={["label", "input", "description", "error"]}
        />
        <TextInput
          {...form.getInputProps("email")}
          placeholder="Email"
          description="Necessary for password resetting, etc."
          label="Email"
          radius="xl"
          size="md"
          inputWrapperOrder={["label", "input", "description", "error"]}
        ></TextInput>
        <PasswordInput
          {...form.getInputProps("password")}
          placeholder="Password"
          label="Password"
          radius="xl"
          size="md"
          mt="sm"
        />
        <PasswordInput
          {...form.getInputProps("confirmPassword")}
          placeholder="Confirm password"
          label="Confirm password"
          radius="xl"
          size="md"
          mt="sm"
        />
        {requiredInviteCode ? (
          <TextInput
            {...form.getInputProps("inviteCode")}
            placeholder="Invite code"
            description="This server requires an invitation code"
            label="Invite code"
            radius="xl"
            size="md"
            mt="sm"
            inputWrapperOrder={["label", "input", "description", "error"]}
          />
        ) : null}
        <Button fullWidth type="submit" mt="lg" disabled={!form.isValid()}>
          Register
        </Button>
      </form>
    </Paper>
  );
}
