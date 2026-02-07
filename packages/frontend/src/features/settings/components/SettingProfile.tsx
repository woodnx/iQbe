import { Button, Center, Grid, Group, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useRef, useState } from "react";
import { Area } from "react-easy-crop";
import store from "storejs";
import UsernameInput from "@/features/user/components/UsernameInput";
import { useLoginedUser } from "@/hooks/useLoginedUser";
import ImageCropper from "@/shared/components/ImageCropper";
import { $api } from "@/utils/client";
import getCroppedImg from "@/utils/getCroppedImage";
import ButtonWithFileInput from "./ButtonWithFileInput";

export default function SettingProfile() {
  const [opened, { open, close }] = useDisclosure(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const { i } = useLoginedUser();
  const [previewImage, setPreviewImage] = useState<string | undefined>(
    i.photoURL ? `http://localhost:9000${i.photoURL}` : undefined,
  );
  const previousUserRef = useRef<Record<string, unknown> | undefined>(
    undefined,
  );
  const previousPreviewImageRef = useRef<string | undefined>(undefined);
  const { mutateAsync: editUser } = $api.useMutation("put", "/i", {
    onMutate: ({ body }) => {
      const previousUser = store.get("loginedUser") as
        | Record<string, unknown>
        | undefined;
      previousUserRef.current = previousUser;

      if (previousUser) {
        store.set("loginedUser", {
          ...previousUser,
          username: body.username,
          nickname: body.nickname,
        });
      }
    },
    onSuccess: (user) => {
      const previousUser = previousUserRef.current;
      if (!previousUser) return;

      store.set("loginedUser", {
        ...previousUser,
        ...user,
      });
    },
    onError: () => {
      const previousUser = previousUserRef.current;
      if (!previousUser) return;
      store.set("loginedUser", previousUser);
    },
  });
  const { mutateAsync: postImage } = $api.useMutation("post", "/i/image", {
    onMutate: () => {
      previousPreviewImageRef.current = previewImage;
      if (imageSrc) {
        setPreviewImage(imageSrc);
      }
    },
    onSuccess: () => {
      notifications.show({
        title: "プロフィール画像を更新しました",
        message: "",
      });
    },
    onError: () => {
      setPreviewImage(previousPreviewImageRef.current);
      notifications.show({
        title: "プロフィール画像の更新に失敗しました",
        message: "しばらくしてからやり直してください",
        color: "red",
      });
    },
  });
  const form = useForm({
    initialValues: {
      username: i.username,
      nickname: i.nickname || undefined,
    },
    validate: {
      username: (value) =>
        !/^[a-zA-Z0-9_]+$/.test(value)
          ? "ユーザ名の文字には a~z, A~Z, 0~9, _ が使用できます"
          : // : !available
            // ? ''
            null,
    },
    validateInputOnChange: true,
  });

  const loadImage = (image: string) => {
    setImageSrc(image);
    open();
  };

  const saveImage = async (croppedAreaPixels: Area) => {
    const croppedImage = await getCroppedImg(imageSrc || "", croppedAreaPixels);

    if (!!croppedImage) {
      const formData = new FormData();
      formData.append("file", croppedImage);

      try {
        await postImage({
          // @ts-ignore
          body: formData,
        });
      } catch {
        return;
      }
    }
    close();
  };

  const submit = async (v: { username: string; nickname?: string }) => {
    await editUser({
      body: {
        username: v.username,
        nickname: v.nickname,
      },
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
        <div style={{ height: "430px" }}>
          <ImageCropper image={imageSrc || undefined} onSave={saveImage} />
        </div>
      </Modal>

      <form onSubmit={form.onSubmit((values) => submit(values))}>
        <Grid m="md">
          <Grid.Col span={{ base: 4, md: 3 }} mt="xs">
            <Center>
              <ButtonWithFileInput image={previewImage} onLoad={loadImage} />
            </Center>
          </Grid.Col>

          <Grid.Col span={{ base: 8, md: 9 }}>
            <UsernameInput
              isValid={form.isValid("username")}
              key={form.key("username")}
              {...form.getInputProps("username")}
            />
            <TextInput
              mt="md"
              label="ニックネーム"
              key={form.key("nickname")}
              {...form.getInputProps("nickname")}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Group justify="center">
              <Button
                radius="xl"
                size="md"
                type="submit"
                disabled={!(form.isValid() && form.isDirty())}
              >
                変更を保存
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </form>
    </>
  );
}
