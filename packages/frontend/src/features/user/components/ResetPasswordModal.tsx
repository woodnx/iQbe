import { Alert, Button, TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import { readResponse, rpc } from "@/utils/client";

interface SubmitValue {
  username: string;
  email: string;
}

interface Props {
  onSubmit: () => void;
}

export default function ResetPasswordModal({ onSubmit }: Props) {
  const form = useForm({
    initialValues: {
      username: "",
      email: "",
    },
    validate: {
      username: isNotEmpty(),
      email: isNotEmpty(),
    },
  });

  const submit = async (v: SubmitValue) => {
    await rpc.api["request-reset-password"]
      .$post({
        json: {
          email: v.email,
          username: v.username,
        },
      })
      .then(readResponse);
    onSubmit();
  };

  return (
    <>
      <form onSubmit={form.onSubmit((v) => submit(v))}>
        <TextInput
          {...form.getInputProps("username")}
          data-autofocus
          placeholder="Username"
          label="Username"
          radius="xl"
          size="md"
          mb="sm"
          inputWrapperOrder={["label", "input", "description", "error"]}
        ></TextInput>
        <TextInput
          {...form.getInputProps("email")}
          placeholder="Email"
          description="Please enter the email address you registered for your account."
          label="Email"
          radius="xl"
          size="md"
          inputWrapperOrder={["label", "input", "description", "error"]}
        ></TextInput>
        <Button fullWidth type="submit" my="lg" disabled={!form.isValid()}>
          Register
        </Button>
      </form>
      <Alert icon={<IconAlertCircle size="1rem" />} title="" color="lime">
        If you have not registered your e-mail address, please contact the
        administrator.
      </Alert>
    </>
  );
}
