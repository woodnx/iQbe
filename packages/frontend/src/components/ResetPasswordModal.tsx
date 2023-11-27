import axios from "@/plugins/axios";
import { Alert, Button, TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { ContextModalProps } from '@mantine/modals';
import { IconAlertCircle } from "@tabler/icons-react";

interface SubmitValue {
  username: string,
  email: string
}

export default function ResetPasswordModal({ context, id, innerProps: _ }: ContextModalProps) {
  const form = useForm({
    initialValues: {
      username: '',
      email: '',
    },
    validate: {
      username: isNotEmpty(),
      email: isNotEmpty()
    }
  });

  const submit = async (v: SubmitValue) => {
    context.closeModal(id);
    await axios.post('/request-reset-password', {
      email: v.email,
      username: v.username,
    }).then(res => res.data);
  }

  return (
    <>
    <form onSubmit={form.onSubmit((v) => submit(v))}>
      <TextInput
        {...form.getInputProps('username')}
        data-autofocus
        placeholder="Username"
        label="Username"
        radius="xl"
        size="md"
        mb="sm"
        inputWrapperOrder={['label', 'input', 'description', 'error']}
      >
      </TextInput>
      <TextInput 
        {...form.getInputProps('email')}
        placeholder="Email"
        description="Please enter the email address you registered for your account."
        label="Email"
        radius="xl"
        size="md"
        inputWrapperOrder={['label', 'input', 'description', 'error']}
      >
      </TextInput>
      <Button
        fullWidth 
        type="submit" 
        my="lg"
        disabled={!form.isValid()}
      >
        Register
      </Button>
    </form>
    <Alert icon={<IconAlertCircle size="1rem"/>} title="" color="lime">
      If you have not registered your e-mail address, please contact the administrator.
    </Alert>
    </>
  )
}