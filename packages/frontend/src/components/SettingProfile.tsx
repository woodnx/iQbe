import { useLoginedUser } from "@/hooks/useLoginedUser";
import { $api } from "@/utils/client";
import { Avatar, Button, Grid, Group, Paper, Stack, Text, TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";

export default function SettingProfile() {
  const { i } = useLoginedUser();
  const { mutateAsync } = $api.useMutation('put', '/i')
  const form = useForm({
    initialValues: {
      username: i.username,
      nickname: i.nickname || undefined,
    },
    validate: {
      username: isNotEmpty(),
    }
  });

  const submit = async (v: {
    username: string,
    nickname?: string,
  }) => {
    console.log(v)
    await mutateAsync({
      body: {
        username: v.username,
        nickname: v.nickname,
      }
    });
  }

  return (
    <form onSubmit={form.onSubmit((values) => submit(values))}>
    <Grid m="md">
      {/* <Grid.Col span={3} mt="xs">
        <Paper component="button" style={{ border: 'none', cursor: 'pointer' }}>
          <Stack align="center" justify="center" gap="xs">
            <Avatar size="xl"/>
            <Text c="gray" fz="sm">変更する</Text>
          </Stack>
        </Paper>
      </Grid.Col> */}

      <Grid.Col span={12}>
        <TextInput 
          withAsterisk
          label="ユーザ名"
          key={form.key('username')}
          {...form.getInputProps('username')}
        />
        <TextInput 
          mt="md"
          label="ニックネーム"
          key={form.key('nickname')}
          {...form.getInputProps('nickname')}
        />
      </Grid.Col>
      <Grid.Col span={12}>
        <Group justify="center">
          <Button 
            radius="xl" 
            size="md" 
            type="submit"
            disabled={!(form.isValid() && form.isDirty())}
          >変更を保存</Button>
        </Group>
      </Grid.Col>
    </Grid>
    </form>
  )
}