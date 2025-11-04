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
import {
  useNavigate,
  useParams,
  useRouter,
  useSearch,
} from "@tanstack/react-router";
import { ReactNode, useState } from "react";
import FilteringModalButton from "@/components/FilteringModalButton";
import MylistDeleteModal from "@/components/MylistDeleteModal";
import MylistEditModalButton from "@/components/MylistEditModalButton";
import QuizControllBar from "@/components/QuizControllBar";
import QuizHiddenAnswerButton from "@/components/QuizHiddenAnswerButton";
import QuizList from "@/components/QuizList";
import QuizPagination from "@/components/QuizPagination";
import QuizShuffleButton from "@/components/QuizShuffleButton";
import QuizTransfarButton from "@/components/QuizTransfarButton";
import { useMylists } from "@/hooks/useMylists";
import { $api } from "@/utils/client";

export default function Mylist() {
  const { mid } = useParams({
    from: "/mylist/$mid",
  });
  const navigator = useNavigate();
  const router = useRouter();
  const search = useSearch({ from: "/mylist/$mid" });
  const theme = useMantineTheme();
  const { mylists } = useMylists();
  const { mutate: deleteMylist } = $api.useMutation("delete", "/mylists");

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
    navigator({ to: "/" });
    notifications.show({
      title: "マイリストを削除しました",
      message: "",
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
