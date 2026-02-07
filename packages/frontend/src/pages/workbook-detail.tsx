import {
  Card,
  Center,
  Group,
  getGradient,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconTrash } from "@tabler/icons-react";
import { useParams, useRouter, useSearch } from "@tanstack/react-router";
import { ReactNode, useState } from "react";
import FilteringModalButton from "@/features/filtering/components/FilteringModalButton";
import MylistEditModalButton from "@/features/mylist/components/MylistEditModalButton";
import QuizControllBar from "@/features/quiz/components/QuizControllBar";
import QuizHiddenAnswerButton from "@/features/quiz/components/QuizHiddenAnswerButton";
import QuizList from "@/features/quiz/components/QuizList";
import QuizPagination from "@/features/quiz/components/QuizPagination";
import QuizShuffleButton from "@/features/quiz/components/QuizShuffleButton";
import QuizTransfarButton from "@/features/quiz/components/QuizTransfarButton";
import { useWorkbooks } from "@/hooks/useWorkbooks";
import { $api } from "@/utils/client";

export default function Mylist() {
  const { wid } = useParams({
    from: "/workbook/$wid",
  });
  const router = useRouter();
  const search = useSearch({ from: "/workbook/$wid" });
  const theme = useMantineTheme();
  const { workbooks } = useWorkbooks(true);

  const workbook = workbooks?.find((list) => list.wid == wid);
  const workbookName = workbook?.name || "";
  const workbookDate = workbook?.date;
  const [activePage, setPage] = useState(1);
  const [isHidden, setIsHidden] = useState(false);
  const { data: quizzes } = $api.useQuery("get", "/quizzes", {
    params: {
      query: {
        ...search,
        wids: [wid],
      },
    },
  });
  const { data: quizzesSize } = $api.useQuery("get", "/quizzes/size", {
    params: {
      query: {
        ...search,
        wids: [wid],
      },
    },
  });
  const size =
    !!quizzes && !!quizzes.length && !!quizzesSize ? quizzesSize.size : 0;

  const toFilter = (
    workbooks?: string | string[],
    keyword?: string,
    keywordOption?: number,
    categories?: number | number[],
    tags?: string | string[],
    tagMatchAll?: boolean,
    perPage?: number,
  ) => {
    setPage(1);
    router.navigate({
      to: "/workbook/$wid",
      params: {
        wid,
      },
      search: (old) => ({
        ...old,
        page: 1,
        seed: undefined,
        maxView: perPage,
        wids: workbooks,
        keyword,
        keywordOption,
        categories,
        tags,
        tagMatchAll,
      }),
      replace: true,
    });
  };

  const toShuffle = (seed: number) => {
    setPage(1);
    router.navigate({
      to: "/workbook/$wid",
      params: {
        wid,
      },
      search: (old) => ({
        ...old,
        page: 1,
        seed,
      }),
      replace: true,
    });
  };

  const changePage = (page: number) => {
    setPage(page);
    router.navigate({
      to: "/workbook/$wid",
      params: {
        wid,
      },
      search: (old) => ({
        ...old,
        page,
      }),
      replace: true,
    });
  };

  const toTransfar = () => {
    router.navigate({
      to: "/practice",
      search: {
        ...search,
        isTransfer: true,
      },
    });
  };

  const WorkbookCard = (
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
          {workbookName}
        </Text>
        <Group justify="md">
          <MylistEditModalButton
            onClick={() => {
              modals.openContextModal({
                modal: "workbookEdit",
                title: "問題集の編集",
                innerProps: {
                  wid,
                  name: workbookName,
                  date: workbookDate || undefined,
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
  ) as ReactNode;

  return (
    <>
      <QuizControllBar
        p="sm"
        total={size}
        header={WorkbookCard}
        buttons={
          <Group>
            <FilteringModalButton onSubmit={toFilter} />
            <QuizShuffleButton apply={toShuffle} />
            <QuizHiddenAnswerButton
              isHidden={isHidden}
              onToggle={setIsHidden}
            />
            <QuizTransfarButton
              apply={toTransfar}
              disabled={quizzes?.length === 0}
            />
          </Group>
        }
        pagination={
          <Stack gap={2}>
            <Center mt="sm">
              <QuizPagination
                page={activePage}
                total={!!search?.maxView ? Math.ceil(size / search.maxView) : 0}
                setPage={changePage}
              />
            </Center>
          </Stack>
        }
      />
      <QuizList
        quizzes={quizzes}
        page={activePage}
        perPage={search.maxView || 0}
        isHidden={isHidden}
      />
    </>
  );
}
