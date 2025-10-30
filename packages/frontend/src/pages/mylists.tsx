import { useEffect } from "react";

import MylistDeleteModal from "@/components/MylistDeleteModal";
import MylistEditModalButton from "@/components/MylistEditModalButton";
import QuizViewer from "@/components/QuizViewer";
import { useMylists } from "@/hooks/useMylists";
import useQuizzes from "@/hooks/useQuizzes";
import { $api } from "@/utils/client";
import {
  Card,
  Center,
  getGradient,
  Group,
  Loader,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { useNavigate, useParams } from "@tanstack/react-router";

export default function Mylist() {
  const { mid } = useParams({
    from: "/mylist/$mid",
  });
  const { setParams } = useQuizzes();
  const navigator = useNavigate();
  const theme = useMantineTheme();
  const { mylists, isLoading } = useMylists();
  const { mutate: deleteMylist } = $api.useMutation("delete", "/mylists");

  const mylistName = mylists?.find((list) => list.mid == mid)?.name;

  useEffect(() => {
    setParams({
      maxView: 100,
      mid,
    });
  }, [mid]);

  if (isLoading)
    return (
      <Center>
        <Loader />
      </Center>
    );

  const hasAccess = mylists?.some((mylist) => mylist.mid === mid);

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      navigator({ to: "/*", replace: true });
    }
  }, [hasAccess, isLoading, navigator]);

  if (!hasAccess) {
    return null;
  }

  const toDelete = async () => {
    deleteMylist({
      body: {
        mid,
      },
    });
    navigator({ to: "/" });
    notifications.show({
      title: "マイリストを削除しました",
      message: "",
    });
  };

  const MylistCard = () => (
    <Card
      mb="xs"
      w="100%"
      withBorder
      style={{
        backgroundImage: getGradient(
          { deg: 45, from: "indigo", to: "cyan" },
          theme,
        ),
        color: `var(--mantine-color-white)`,
      }}
    >
      <Group justify="space-between">
        <Text fw={700} fz={25}>
          {mylistName}
        </Text>
        <Group justify="md">
          <MylistEditModalButton
            onClick={() => {
              modals.openContextModal({
                modal: "mylistEdit",
                title: "マイリストを編集",
                innerProps: {
                  mid,
                  name: mylistName || "",
                },
                size: "md",
                centered: true,
                zIndex: 200,
              });
            }}
          />
          <MylistDeleteModal onDelete={toDelete} />
        </Group>
      </Group>
    </Card>
  );

  return (
    <>
      <QuizViewer key={mid} headerCard={<MylistCard />} />
    </>
  );
}
