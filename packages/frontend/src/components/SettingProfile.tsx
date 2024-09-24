import { useLoginedUser } from "@/hooks/useLoginedUser";
import { $api } from "@/utils/client";
import { Button, Grid, Group, Modal, TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import ImageCropper from "./ImageCropper";
import { useState } from "react";
import ButtonWithFileInput from "./ButtonWithFileInput";
import { Area } from "react-easy-crop";
import getCroppedImg from "@/utils/getCroppedImage";
import { notifications } from "@mantine/notifications";

export default function SettingProfile() {
  const [ opened, { open, close } ] = useDisclosure(false);
  const [ imageSrc, setImageSrc ] = useState<string | null>(null)
  const { i } = useLoginedUser();
  const { mutateAsync: editUser } = $api.useMutation('put', '/i');
  const { mutateAsync: postImage } = $api.useMutation('post', '/i/image');
  const form = useForm({
    initialValues: {
      username: i.username,
      nickname: i.nickname || undefined,
    },
    validate: {
      username: isNotEmpty(),
    }
  });

  const loadImage = (image: string) => {
    setImageSrc(image);
    open();
  }

  const saveImage = async (croppedAreaPixels: Area) => {
    const croppedImage = await getCroppedImg(imageSrc || '', croppedAreaPixels);

    if (!!croppedImage) {
      const formData = new FormData();
      formData.append('file', croppedImage);

      try {
        await postImage({ 
          // @ts-ignore
          body: formData,
        });

        notifications.show({
          title: 'プロフィール画像を更新しました',
          message: '',
        })
      } catch {
        notifications.show({
          title: 'プロフィール画像の更新に失敗しました',
          message: 'しばらくしてからやり直してください',
          color: 'red'
        })
      }
    }
    close();
  }

  const submit = async (v: {
    username: string,
    nickname?: string,
  }) => {
    await editUser({
      body: {
        username: v.username,
        nickname: v.nickname,
      }
    });
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        centered
        padding={0}
        size={300}
      > 
        <div style={{ height: '430px' }}>
          <ImageCropper 
            image={imageSrc || undefined}
            onSave={saveImage}
          />
        </div>
      </Modal>
      
      <form onSubmit={form.onSubmit((values) => submit(values))}>
        <Grid m="md">
          <Grid.Col span={3} mt="xs">
            <ButtonWithFileInput 
              image={`http://localhost:9000${i.photoURL}` || undefined}
              onLoad={loadImage}
            />
          </Grid.Col>

          <Grid.Col span={9}>
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
    </>
  )
}