import FilteringModal from "@/features/filtering/components/FilteringModal";
import FilteringModalButton from "@/features/filtering/components/FilteringModalButton";
import PracticeQuitModal from "@/features/practice/components/PracticeQuitModal";
import { PracticeQuizController } from "@/features/practice/components/PracticeQuizController";
import { PracticeQuizIntro } from "@/features/practice/components/PracticeQuizIntro";
import PracticeResultModal from "@/features/practice/components/PracticeResultModal";
import { PracticeSaveStatus } from "@/features/practice/components/PracticeSaveStatus";
import {
  REJECTION_MESSAGES,
  type RejectedStatus,
  toRejectedStatus,
} from "@/features/practice/practiceSaveRejection";
import { useTimer } from "@/hooks";
import { db } from "@/plugins/db";
import type { Quiz as ApiQuiz } from "@/utils/api-types";
import { readResponse, rpc } from "@/utils/client";
import {
  QUIZZES_QUERY_KEY,
  QuerySnapshot,
  restoreQuerySnapshot,
  takeQuerySnapshot,
} from "@/utils/queryCache";
import { Group, Loader, Overlay, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearch } from "@tanstack/react-router";
import type { InferRequestType } from "hono/client";
import { useEffect, useRef, useState } from "react";

type Quiz = ApiQuiz;
export type Scene = "preparation" | "ready" | "quizzing" | "result";

interface Props {
  quizzes?: Quiz[];
  size: number;
  shuffledList: number[];
  isTransfer?: boolean;
  initialIndex: number;
  resumeId?: number;
  onFilter?: () => void;
  onJudge?: () => void;
}

export default function PracticeSceneChanger({
  quizzes,
  size,
  shuffledList,
  isTransfer = false,
  initialIndex,
  resumeId,
  onFilter = () => {},
}: Props) {
  const search = useSearch({ from: "/practice" });
  const startImmediately =
    resumeId !== undefined || isTransfer || search.seed != null;
  const [nowNumber, setNowNumber] = useState(initialIndex);

  const [scene, setScene] = useState<Scene>(
    initialIndex >= (quizzes?.length ?? Infinity)
      ? "result"
      : startImmediately
        ? "ready"
        : "preparation",
  );
  const [startTrigger, setStartTrigger] = useState(startImmediately);
  const [filtering, filter] = useDisclosure(false);
  const openFilter = filter.open;
  const [_, result] = useDisclosure(false);
  const router = useRouter();

  const pendingAttempt = useRef<{
    input: InferRequestType<typeof rpc.api.practice.$post>;
    action: "next" | "quit";
    nextNumber: number;
    recorded: boolean;
  } | null>(null);
  const saving = useRef(false);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "failed" | "rejected"
  >("idle");
  const rejectedStatus = useRef<RejectedStatus | null>(null);
  const [shownRejectedStatus, setShownRejectedStatus] =
    useState<RejectedStatus | null>(null);
  // 「やめる」経路で送る押し位置。別の問題の位置を送らないよう、表示中の問題と組にする。
  const pressedWord = useRef<{ qid: string; position: number } | null>(null);
  // 同じ問題へ戻った場合も、子コンポーネントの押し位置と入力状態を作り直すための世代。
  const [attemptGeneration, setAttemptGeneration] = useState(0);
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationKey: ["post", "/practice"],
    mutationFn: (input: InferRequestType<typeof rpc.api.practice.$post>) =>
      rpc.api.practice.$post(input).then(readResponse),
    onMutate: async ({ json: body }) => {
      await queryClient.cancelQueries({ queryKey: QUIZZES_QUERY_KEY });
      const previousQuizzes = takeQuerySnapshot<Quiz[]>(
        queryClient,
        QUIZZES_QUERY_KEY,
      );

      queryClient.setQueriesData<Quiz[] | undefined>(
        { queryKey: QUIZZES_QUERY_KEY },
        (data) =>
          data?.map((quiz) => {
            if (quiz.qid === body.qid)
              return {
                ...quiz,
                total: quiz.total + 1,
                right: body.judgement === 1 ? quiz.right + 1 : quiz.right,
                judgement: body.judgement,
              };
            else return quiz;
          }),
      );

      return { previousQuizzes };
    },
    onError: (_, __, context) => {
      const rollback = context as
        | {
            previousQuizzes: QuerySnapshot<Quiz[]>;
          }
        | undefined;
      if (!rollback) return;
      restoreQuerySnapshot(queryClient, rollback.previousQuizzes);
    },
    onSettled: () => {
      // Keep the current practice list stable; refresh it on the next visit.
      queryClient.invalidateQueries({
        queryKey: QUIZZES_QUERY_KEY,
        refetchType: "none",
      });
    },
  });
  const [rightList, setRightList] = useState<string[]>([]);
  const quiz = quizzes ? quizzes[shuffledList[nowNumber]] : null;
  const maxQuizSize = quizzes?.length || 0;

  const delay = useTimer(500, 100, () => setScene("quizzing"));

  useEffect(() => {
    if (!startImmediately) openFilter();
  }, [startImmediately, openFilter]);

  const resetAttempt = () => {
    pressedWord.current = null;
    setAttemptGeneration((generation) => generation + 1);
  };

  const resolveQuitPressedWord = () =>
    pressedWord.current !== null && pressedWord.current.qid === quiz?.qid
      ? pressedWord.current.position
      : -1;

  const toFilter = (
    wids?: string | string[],
    keyword?: string,
    keywordOption?: number,
    categories?: number | number[],
    tags?: string | string[],
    tagMatchAll?: boolean,
    maxView?: number,
  ) => {
    if (pendingAttempt.current) return;
    const seed = search.seed ?? Math.floor(Math.random() * 100000);
    router.navigate({
      to: "/practice",
      search: (old) => ({
        ...old,
        page: 1,
        seed,
        maxView,
        wids,
        keyword,
        keywordOption,
        categories,
        tags,
        tagMatchAll,
      }),
      replace: true,
    });
    filter.close();
    onFilter();
    resetAttempt();
    setNowNumber(0);
    setStartTrigger(true);
    setScene("ready");
  };

  const advanceTo = async (nextNumber: number) => {
    if (resumeId !== undefined) {
      await db.practiceSessions.update(resumeId, {
        currentIndex: nextNumber,
        updatedAt: new Date(),
      });
      await queryClient.invalidateQueries({
        queryKey: ["practiceSession", resumeId],
      });
    }
    resetAttempt();
    if (nextNumber >= maxQuizSize) {
      setScene("result");
    } else {
      setNowNumber(nextNumber);
      setScene("ready");
    }
  };

  const clearPendingAttempt = () => {
    pendingAttempt.current = null;
    rejectedStatus.current = null;
    setShownRejectedStatus(null);
    setSaveState("idle");
  };

  const savePendingAttempt = async () => {
    const attempt = pendingAttempt.current;
    // Guard synchronously, including clicks before React renders disabled controls.
    if (!attempt || saving.current || rejectedStatus.current !== null) return;
    saving.current = true;
    setSaveState("saving");

    try {
      if (!attempt.recorded) {
        await mutateAsync(attempt.input);
        attempt.recorded = true;
        if (attempt.input.json.judgement === 1) {
          setRightList((previous) => [...previous, attempt.input.json.qid]);
        }
      }

      if (attempt.action === "quit") {
        await router.navigate({ to: "/" });
      } else {
        await advanceTo(attempt.nextNumber);
      }
      clearPendingAttempt();
    } catch (error) {
      const rejection = attempt.recorded ? null : toRejectedStatus(error);
      if (rejection !== null) {
        rejectedStatus.current = rejection;
        setShownRejectedStatus(rejection);
        setSaveState("rejected");
        notifications.show({ ...REJECTION_MESSAGES[rejection], color: "red" });
        return;
      }
      setSaveState("failed");
      notifications.show({
        title: "保存に失敗しました",
        message: attempt.recorded
          ? "解答は保存済みです。「もう一度保存する」で演習の進行を再開できます。"
          : "解答の保存を確認できませんでした。「もう一度保存する」で同じ解答を再送できます。",
        color: "red",
      });
    } finally {
      saving.current = false;
    }
  };

  // 拒否された解答を新しい clientAttemptId で自動送信しないのは、409 の原因や削除済みの
  // 問題を解決せず、利用者の意図しない別の解答を作り得るため。進めるかは利用者が選ぶ。
  // 401 ではこの解答を保存せずにログイン画面へ移る（演習の進行は進めないので、
  // 中断データから再開すると同じ問題から解き直せる）。
  const discardRejectedAttempt = async () => {
    const attempt = pendingAttempt.current;
    const rejection = rejectedStatus.current;
    if (!attempt || rejection === null || saving.current) return;
    saving.current = true;
    try {
      if (rejection === 401) {
        await router.navigate({ to: "/login" });
      } else if (attempt.action === "quit") {
        await router.navigate({ to: "/" });
      } else {
        await advanceTo(attempt.nextNumber);
      }
      clearPendingAttempt();
    } catch {
      notifications.show({
        title: "演習の進行に失敗しました",
        message: "もう一度お試しください。",
        color: "red",
      });
    } finally {
      saving.current = false;
    }
  };

  const record = async (
    judgement: number,
    pressedWord: number,
    action: "next" | "quit",
  ) => {
    if (!quiz || pendingAttempt.current) return;
    pendingAttempt.current = {
      input: {
        json: {
          qid: quiz.qid,
          judgement,
          pressedWord,
          clientAttemptId: crypto.randomUUID(),
        },
      },
      action,
      nextNumber: nowNumber + 1,
      recorded: false,
    };
    await savePendingAttempt();
  };

  return (
    <>
      {scene == "ready" ? (
        <Overlay fixed center>
          {!quiz || !startTrigger ? (
            <Loader variant="dots" />
          ) : (
            <PracticeQuizIntro ta="center" onFinish={delay.start} />
          )}
        </Overlay>
      ) : null}
      <FilteringModal
        isFilterKeyword={true}
        opened={filtering}
        onSubmit={toFilter}
        onClose={toFilter}
      />
      <PracticeResultModal
        rightTotal={rightList.length}
        quizzesTotal={maxQuizSize || 1}
        isTransfer={isTransfer}
        canNext={
          quizzes && search.maxView && search.page
            ? Math.ceil(size / search.maxView) >= search.page + 1
            : false
        }
        opened={scene == "result"}
        onClose={result.close}
        onRetry={() => {
          resetAttempt();
          setScene("ready");
          setNowNumber(0);
        }}
        onNext={() => {
          router.navigate({
            to: "/practice",
            search: (old) => ({
              ...old,
              page: old?.page ? old.page + 1 : 0,
            }),
            replace: true,
          });
          resetAttempt();
          setScene("ready");
          setNowNumber(0);
        }}
        onTry={filter.open}
        onQuit={() => router.navigate({ to: "/" })}
      />
      <PracticeSaveStatus
        state={saveState}
        rejectedStatus={shownRejectedStatus}
        onRetry={savePendingAttempt}
        onDiscard={discardRejectedAttempt}
      />
      <Group justify="space-between">
        <FilteringModalButton
          disabled={saveState !== "idle"}
          onSubmit={toFilter}
        />
        <PracticeQuitModal
          disabled={saveState !== "idle"}
          onJudge={(j) => record(j, resolveQuitPressedWord(), "quit")}
        />
      </Group>
      <Text ta="center">
        <Text span fz={38} fw={700}>
          {nowNumber + 1}
        </Text>
        <Text span fz={18} fw={500}>
          {" "}
          / {maxQuizSize}
        </Text>
      </Text>
      {quiz && (
        <PracticeQuizController
          key={`${quiz.qid}:${attemptGeneration}`}
          quiz={quiz}
          scene={scene}
          ignoreLimit={3000}
          countLimit={5000}
          disabled={saveState !== "idle"}
          onJudge={(j, w) => record(j, w, "next")}
          onPressedWordChange={(position) => {
            pressedWord.current = { qid: quiz.qid, position };
          }}
        />
      )}
    </>
  );
}
