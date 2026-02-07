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
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import {
  useNavigate,
  useParams,
  useRouter,
  useSearch,
} from "@tanstack/react-router";
import { components } from "api/schema";
import { ReactNode, useRef, useState } from "react";
import FilteringModalButton from "@/features/filtering/components/FilteringModalButton";
import MylistDeleteModal from "@/features/mylist/components/MylistDeleteModal";
import MylistEditModalButton from "@/features/mylist/components/MylistEditModalButton";
import QuizControllBar from "@/features/quiz/components/QuizControllBar";
import QuizHiddenAnswerButton from "@/features/quiz/components/QuizHiddenAnswerButton";
import QuizList from "@/features/quiz/components/QuizList";
import QuizPagination from "@/features/quiz/components/QuizPagination";
import QuizShuffleButton from "@/features/quiz/components/QuizShuffleButton";
import QuizTransfarButton from "@/features/quiz/components/QuizTransfarButton";
import { useMylists } from "@/hooks/useMylists";
import { $api } from "@/utils/client";
import {
  MYLISTS_QUERY_KEY,
  QUIZ_SIZES_QUERY_KEY,
  QUIZZES_QUERY_KEY,
  QuerySnapshot,
  restoreQuerySnapshot,
  takeQuerySnapshot,
} from "@/utils/queryCache";

type Mylist = components["schemas"]["Mylist"];
type Quiz = components["schemas"]["Quiz"];
type QuizSize = { size: number };

export default function Mylist() {
  const { mid } = useParams({
    from: "/mylist/$mid",
  });
  const navigator = useNavigate();
  const router = useRouter();
  const search = useSearch({ from: "/mylist/$mid" });
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const previousMylistsRef = useRef<QuerySnapshot<Mylist[]>>([]);
  const previousQuizzesRef = useRef<QuerySnapshot<Quiz[]>>([]);
  const previousQuizSizesRef = useRef<QuerySnapshot<QuizSize>>([]);
  const { mylists } = useMylists();
  const { mutate: deleteMylist } = $api.useMutation("delete", "/mylists", {
    onMutate: async ({ body }) => {
      const targetMid = body.mid;

      await queryClient.cancelQueries({ queryKey: MYLISTS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: QUIZZES_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: QUIZ_SIZES_QUERY_KEY });

      const previousMylists = takeQuerySnapshot<Mylist[]>(
        queryClient,
        MYLISTS_QUERY_KEY,
      );
      const previousQuizzes = takeQuerySnapshot<Quiz[]>(
        queryClient,
        QUIZZES_QUERY_KEY,
      );
      const previousQuizSizes = takeQuerySnapshot<QuizSize>(
        queryClient,
        QUIZ_SIZES_QUERY_KEY,
      );
      previousMylistsRef.current = previousMylists;
      previousQuizzesRef.current = previousQuizzes;
      previousQuizSizesRef.current = previousQuizSizes;

      previousMylists.forEach(([key, data]) => {
        queryClient.setQueryData<Mylist[] | undefined>(
          key,
          data?.filter((mylist) => mylist.mid !== targetMid),
        );
      });

      previousQuizzes.forEach(([key, data]) => {
        const query = (key[2] as { params?: { query?: { mid?: string } } })
          ?.params?.query;

        const nextData =
          query?.mid === targetMid
            ? []
            : data?.map((quiz) => ({
                ...quiz,
                registerdMylist: quiz.registerdMylist?.filter(
                  (mylist) => mylist.mid !== targetMid,
                ),
              }));

        queryClient.setQueryData<Quiz[] | undefined>(key, nextData);
      });

      previousQuizSizes.forEach(([key, data]) => {
        const query = (key[2] as { params?: { query?: { mid?: string } } })
          ?.params?.query;

        queryClient.setQueryData<QuizSize | undefined>(
          key,
          query?.mid === targetMid ? { size: 0 } : data,
        );
      });
    },
    onError: () => {
      restoreQuerySnapshot(queryClient, previousMylistsRef.current);
      restoreQuerySnapshot(queryClient, previousQuizzesRef.current);
      restoreQuerySnapshot(queryClient, previousQuizSizesRef.current);
    },
    onSuccess: () => {
      navigator({ to: "/" });
      notifications.show({
        title: "マイリストを削除しました",
        message: "",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MYLISTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: QUIZZES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: QUIZ_SIZES_QUERY_KEY });
    },
  });

  const mylistName = mylists?.find((list) => list.mid == mid)?.name;
  const [activePage, setPage] = useState(1);
  const [isHidden, setIsHidden] = useState(false);
  const { data: quizzes } = $api.useQuery("get", "/quizzes", {
    params: {
      query: {
        ...search,
        mid,
      },
    },
  });
  const { data: quizzesSize } = $api.useQuery("get", "/quizzes/size", {
    params: {
      query: {
        ...search,
        mid,
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
      to: "/mylist/$mid",
      params: {
        mid,
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
      to: "/mylist/$mid",
      params: {
        mid,
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
      to: "/mylist/$mid",
      params: {
        mid,
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

  const toDelete = async () => {
    deleteMylist({
      body: {
        mid,
      },
    });
  };

  const MylistCard = (
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
  ) as ReactNode;

  return (
    <>
      <QuizControllBar
        p="sm"
        total={size}
        header={MylistCard}
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
