import { client } from "@/utils/client";
import {
  Flex,
  Loader,
  Space,
  Text,
  TextInput,
  TextInputProps,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { useState } from "react";

function checkUsernameAvailable(username: string): Promise<boolean> {
  return client
    .POST("/auth/available", { body: { username } })
    .then(({ data }) => !!data?.available);
}

export interface UsernameInputProps extends TextInputProps {
  isValid?: boolean;
}

export default function UsernameInput({
  isValid = true,
  value,
  onChange = () => {},
  ...others
}: UsernameInputProps) {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheck = useDebouncedCallback(async (username: string) => {
    setLoading(true);
    setAvailable(await checkUsernameAvailable(username));
    setLoading(false);
  }, 500);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event);
    handleCheck(event.currentTarget.value);
  };

  const Description = () => (
    <>
      {!isValid ? (
        <Flex align="center">
          <IconAlertCircle size={14} color="red" />
          <Text span c="red" mx={5}>
            無効なユーザ名です
          </Text>
          <IconAlertCircle size={14} color="red" />
        </Flex>
      ) : !available ? (
        <Flex align="center">
          <IconAlertCircle size={14} color="red" />
          <Text span c="red" mx={5}>
            このユーザ名はすでに使われています
          </Text>
          <IconAlertCircle size={14} color="red" />
        </Flex>
      ) : (
        <Flex align="center">
          <IconCheck size={14} color="green" />
          <Space w={5} />
          <Text span c="green">
            使用可能なユーザ名です
          </Text>
        </Flex>
      )}
    </>
  );

  return (
    <TextInput
      withAsterisk
      label="ユーザ名"
      description={<Description />}
      leftSection="@"
      rightSection={loading && <Loader size={20} />}
      value={value}
      onChange={handleChange}
      inputWrapperOrder={["label", "input", "description", "error"]}
      {...others}
    />
  );
}
