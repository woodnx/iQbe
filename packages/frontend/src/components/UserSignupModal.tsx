import { useNavigate } from "react-router-dom";
import { Button, Flex, Paper, PasswordInput, Space, Text, TextInput } from "@mantine/core";
import { useForm, isNotEmpty, matchesField } from '@mantine/form';
import { notifications } from "@mantine/notifications";
import { signupUser } from "../plugins/auth";
import { useEffect, useState } from "react";
import axios from "../plugins/axios";
import { IconAlertTriangle } from "@tabler/icons-react";
import { IconCheck } from "@tabler/icons-react";

interface SubmitValue {
  username: string,
  password: string,
  inviteCode?: string,
}

const requiredInviteCode = import.meta.env.VITE_REQUIRED_INVITE_CODE !== 'false' ? true : false;

export function UserSignupModal() {
  const [ available, setAvailable ] = useState(false);
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
      inviteCode: '',
    },
    validate: {
      username: (value) => 
        !(/^[a-zA-Z0-9_]+$/.test(value)) 
        ? 'Can use a~z, A~Z, 0~9, _ for username'
        : !available
        ? ''
        : null,
      password: isNotEmpty('Password is required'),
      confirmPassword: matchesField('password', 'Passwords are not the same'),
    },
    validateInputOnChange: true,
  });

  useEffect(() => {
    axios.post('/auth/available', {
      username: form.values.username
    }).then(res => res.data)
    .then(data => !!data.available)
    .then(available => { 
      setAvailable(available);
      if (!available && form.values.username.length > 0) form.setFieldError('username', errormes);
    });
  }, [ form.values.username ]);

  const discription = (
    <>
      <Flex align="center">
        <IconAlertTriangle size={14}/>
        <Space w={5}/>
        <Text>Cannot be changed later</Text>
      </Flex>
      { 
        available && form.isValid('username') ? 
          <Flex align="center">
            <IconCheck size={14} color="green"/>
            <Space w={5}/>
            <Text span color="green"> Can use this name </Text>
          </Flex>
        : null
      }
    </>
  );

  const errormes = (
    <>
      <Flex align="center">
        <IconAlertTriangle size={14}/>
        <Space w={5}/>
        <Text span>This name is already in use</Text>
      </Flex>
    </>
  );

  const submit = async (values: SubmitValue) => {
    try { 
      await signupUser(values.username, values.password, requiredInviteCode, values.inviteCode)
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
    <Paper>
      <form onSubmit={form.onSubmit(v => submit(v))}>
        <TextInput 
          {...form.getInputProps('username')}
          placeholder="Username"
          description={discription}
          label="Username"
          radius="xl"
          size="md"
          inputWrapperOrder={['label', 'input', 'description', 'error']}
        >
        </TextInput>
        <PasswordInput
          {...form.getInputProps('password')}
          placeholder="Password"
          label="Password"
          radius="xl"
          size="md"
          mt="sm"
        />
        <PasswordInput
          {...form.getInputProps('confirmPassword')}
          placeholder="Confirm password"
          label="Confirm password"
          radius="xl"
          size="md"
          mt="sm"
        />
        {
          requiredInviteCode 
          ? 
          <TextInput
            {...form.getInputProps('inviteCode')}
            placeholder="Invite code"
            label="Invite code"
            radius="xl"
            size="md"
            mt="sm"
          /> 
          : null
        }
        <Button 
          fullWidth 
          type="submit" 
          mt="lg"
          disabled={!form.isValid()}
        >
          Register
        </Button>
      </form>
    </Paper>
  );
}