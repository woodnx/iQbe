import { ActionIcon, Button, Checkbox, Divider, Menu } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconPlaylistAdd, IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType } from "hono/client";
import { ComponentProps, useState } from "react";
import { useIsMobile } from "@/contexts/isMobile";
import type { Mylist as ApiMylist, Quiz as ApiQuiz } from "@/utils/api-types";
import { readResponse, rpc } from "@/utils/client";
import {
  QUIZZES_QUERY_KEY,
  QuerySnapshot,
  restoreQuerySnapshot,
  takeQuerySnapshot,
  updateRelatedQuizSize,
} from "@/utils/queryCache";

import classes from "./styles/QuizMylistButton.module.css";

type Mylist = ApiMylist;
type Quiz = ApiQuiz;

interface Props extends ComponentProps<typeof Button> {
  qid: string;
  registerdMylists: Mylist[];
}

export default function QuizMylistButton({ qid, registerdMylists }: Props) {
  const { data: mylists } = useQuery({
    queryKey: ["get", "/mylists"],
    // This button mounts for every practice question. Reuse the cached lists.
    refetchOnMount: false,
    queryFn: ({ signal }) =>
      rpc.api.mylists.$get({}, { init: { signal: signal } }).then(readResponse),
  });
  const [selectedMids, setSelectedMids] = useState(
    registerdMylists.map((mylist) => mylist.mid),
  );
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { mutate: addQuizToMylist } = useMutation({
    mutationKey: ["post", "/register"],
    mutationFn: (input: InferRequestType<typeof rpc.api.register.$post>) =>
      rpc.api.register.$post(input).then(readResponse),
    onMutate: async ({ json: body }) => {
      await queryClient.cancelQueries({ queryKey: QUIZZES_QUERY_KEY });
      const previousQuizzes = takeQuerySnapshot<Quiz[]>(
        queryClient,
        QUIZZES_QUERY_KEY,
      );
      const previousSelectedMids = selectedMids;

      setSelectedMids((prev) =>
        prev.includes(body.mid) ? prev : [...prev, body.mid],
      );

      const optimisticMylist =
        mylists?.find((mylist) => mylist.mid === body.mid) ||
        ({
          mid: body.mid,
          name: "",
          created: new Date().toISOString(),
          total: 0,
          corrects: 0,
          wrongs: 0,
          ignored: 0,
          lastPracticedAt: null,
        } as Mylist);

      queryClient.setQueriesData<Quiz[] | undefined>(
        { queryKey: QUIZZES_QUERY_KEY },
        (data) =>
          data?.map((quiz) =>
            quiz.qid === body.qid
              ? {
                  ...quiz,
                  registerdMylist: [
                    ...(quiz.registerdMylist || []).filter(
                      (mylist) => mylist.mid !== body.mid,
                    ),
                    optimisticMylist,
                  ],
                }
              : quiz,
          ),
      );

      return { previousQuizzes, previousSelectedMids };
    },
    onSuccess: () => {
      notifications.show({
        title: "マイリストに追加",
        message: "マイリストにクイズを追加しました",
      });
    },
    onError: (_, __, context) => {
      const rollback = context as
        | {
            previousQuizzes: QuerySnapshot<Quiz[]>;
            previousSelectedMids: string[];
          }
        | undefined;
      if (!rollback) return;
      restoreQuerySnapshot(queryClient, rollback.previousQuizzes);
      setSelectedMids(rollback.previousSelectedMids);
      notifications.show({
        title: "何らかの障害が発生しました",
        message: "何度も続く場合はサポート担当に問い合わせてください",
        color: "red",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUIZZES_QUERY_KEY });
    },
  });
  const { mutate: deleteQuizFromMylist } = useMutation({
    mutationKey: ["post", "/unregister"],
    mutationFn: (input: InferRequestType<typeof rpc.api.unregister.$post>) =>
      rpc.api.unregister.$post(input).then(readResponse),
    onMutate: async ({ json: body }) => {
      await queryClient.cancelQueries({ queryKey: QUIZZES_QUERY_KEY });
      const previousQuizzes = takeQuerySnapshot<Quiz[]>(
        queryClient,
        QUIZZES_QUERY_KEY,
      );
      const previousSelectedMids = selectedMids;

      setSelectedMids((prev) => prev.filter((mid) => mid !== body.mid));

      previousQuizzes.forEach(([key, data]) => {
        const query = (key[2] as { params?: { query?: { mid?: string } } })
          ?.params?.query;
        const nextData =
          query?.mid === body.mid
            ? data?.filter((quiz) => quiz.qid !== body.qid)
            : data?.map((quiz) =>
                quiz.qid === body.qid
                  ? {
                      ...quiz,
                      registerdMylist: quiz.registerdMylist?.filter(
                        (mylist) => mylist.mid !== body.mid,
                      ),
                    }
                  : quiz,
              );

        queryClient.setQueryData<Quiz[] | undefined>(key, nextData);

        if (data && nextData && data.length !== nextData.length) {
          updateRelatedQuizSize(
            queryClient,
            key,
            nextData.length - data.length,
          );
        }
      });

      return { previousQuizzes, previousSelectedMids };
    },
    onSuccess: () => {
      notifications.show({
        title: "マイリストから削除",
        message: "マイリストからクイズを削除しました",
      });
    },
    onError: (_, __, context) => {
      const rollback = context as
        | {
            previousQuizzes: QuerySnapshot<Quiz[]>;
            previousSelectedMids: string[];
          }
        | undefined;
      if (!rollback) return;
      restoreQuerySnapshot(queryClient, rollback.previousQuizzes);
      setSelectedMids(rollback.previousSelectedMids);
      notifications.show({
        title: "何らかの障害が発生しました",
        message: "何度も続く場合はサポート担当に問い合わせてください",
        color: "red",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUIZZES_QUERY_KEY });
    },
  });

  const saveToList = async (mid: string) => {
    if (!selectedMids.includes(mid)) {
      addQuizToMylist({
        json: {
          qid,
          mid,
        },
      });
    } else {
      deleteQuizFromMylist({
        json: {
          qid,
          mid,
        },
      });
    }
  };

  const defaultButton = (
    <Button
      classNames={{ root: classes.button }}
      leftSection={<IconPlaylistAdd />}
      variant="outline"
      size="xs"
      bg="#fff"
    >
      追加
    </Button>
  );

  const mobileButton = (
    <ActionIcon size="md" color="blue" variant="light">
      <IconPlaylistAdd />
    </ActionIcon>
  );

  return (
    <>
      <Menu
        shadow="sm"
        width={200}
        position="right-start"
        withinPortal
        closeOnItemClick={false}
      >
        <Menu.Target>{isMobile ? mobileButton : defaultButton}</Menu.Target>
        <Menu.Dropdown>
          {mylists?.map((m) => (
            <Menu.Item key={m.mid}>
              <Checkbox
                label={m.name}
                checked={selectedMids.includes(m.mid)}
                onChange={() => saveToList(m.mid)}
              />
            </Menu.Item>
          ))}
          <Divider />
          <Menu.Item
            leftSection={<IconPlus size={14} />}
            onClick={() => {
              modals.openContextModal({
                modal: "mylistCreate",
                title: "マイリストを新規作成",
                innerProps: {
                  qid,
                },
                size: "md",
                centered: true,
                zIndex: 10000,
              });
            }}
          >
            マイリストを作成
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
}
