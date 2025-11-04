import { useEffect } from "react";
import {
  Card,
  Center,
  Group,
  Loader,
  Text,
  getGradient,
  useMantineTheme,
} from "@mantine/core";
import { useWorkbooks } from "@/hooks/useWorkbooks";
import QuizViewer from "./QuizViewer";
import MylistEditModalButton from "./MylistEditModalButton";
import { IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router";

interface Props {
  wid: string;
}

export default function ({ wid }: Props) {
  const theme = useMantineTheme();
  const { workbooks, isLoading } = useWorkbooks(true);
  const navigate = useNavigate();
  const router = useRouter();
  const search = useSearch({ from: "/workbook/$wid" });

  useEffect(() => {
    const wids = search.wids;
    const hasWid =
      Array.isArray(wids) ? wids.includes(wid) : typeof wids === "string" ? wids === wid : false;
    const needsWids = !hasWid;
    const needsPage = !search.page;
    const needsMaxView = !search.maxView;

    if (!needsWids && !needsPage && !needsMaxView) return;

    router.navigate({
      to: "/workbook/$wid",
      params: { wid },
      search: (old) => ({
        ...old,
        page: old.page ?? 1,
        maxView: old.maxView ?? 100,
        wids: [wid],
      }),
      replace: true,
    });
  }, [router, search.wids, search.page, search.maxView, wid]);

  if (isLoading)
    return (
      <Center>
        <Loader />
      </Center>
    );

  const workbook = workbooks?.find((list) => list.wid == wid);
  const name = workbook?.name || "";
  const date = workbook?.date;

  const hasAccess = workbooks?.some((workbook) => workbook.wid === wid);

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      navigate({ to: "/not-found", replace: true });
    }
  }, [hasAccess, isLoading, navigate]);

  if (!hasAccess) {
    return null;
  }

  const CreateCard = () => (
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
          {name}
        </Text>
        <Group>
          <MylistEditModalButton
            onClick={() => {
              modals.openContextModal({
                modal: "workbookEdit",
                title: "問題集の編集",
                innerProps: {
                  wid,
                  name,
                  date: date || undefined,
                },
              });
            }}
          />
          <MylistEditModalButton
            icon={IconTrash}
            label="削除"
            onClick={() => {
              modals.openContextModal({
                modal: "workbookDelete",
                title: "問題集の削除",
                innerProps: {
                  wid,
                },
              });
            }}
          />
        </Group>
      </Group>
    </Card>
  );

  return (
    <>
      <QuizViewer
        routeId="/workbook/$wid"
        routeParams={{ wid }}
        headerCard={<CreateCard />}
      />
    </>
  );
}
