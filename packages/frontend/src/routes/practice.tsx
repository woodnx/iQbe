import PracticeSceneChanger from "@/features/practice/components/PracticeSceneChanger";
import { db } from "@/plugins/db";
import { cleanQuery, readResponse, rpc } from "@/utils/client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";
import { quizSearchSchema } from "./_schemas/quizSearch";

export const Route = createFileRoute("/practice")({
  component: RouteComponent,
  validateSearch: quizSearchSchema.extend({
    isTransfer: z
      .union([z.string(), z.boolean()])
      .optional()
      .transform((v): boolean | undefined => {
        if (typeof v === "boolean") return v;
        if (v === "true") return true;
        if (v === "false") return false;
        return undefined;
      }),
    resumeId: z.coerce.number().int().positive().optional(),
  }),
});

function RouteComponent() {
  const [shouldFetch, setShouldFetch] = useState(false);
  const search = useSearch({ from: "/practice" });
  const resumeId = search.resumeId;
  const isResume = resumeId !== undefined;

  const shouldFetchNormal =
    !isResume &&
    (shouldFetch || search.isTransfer === true || search.seed != null);

  const { data: quizzes } = useQuery({
    queryKey: [
      "get",
      "/quizzes",
      {
        params: { query: search },
      },
    ],
    queryFn: async ({ signal }) => {
      const quizzes = await rpc.api.quizzes
        .$get({ query: cleanQuery(search) }, { init: { signal: signal } })
        .then(readResponse);

      return quizzes;
    },
    enabled: shouldFetchNormal,
  });
  const { data: newSessionId } = useQuery({
    queryKey: ["newPracticeSession", search, quizzes?.map((quiz) => quiz.qid)],
    queryFn: () => {
      if (!quizzes) throw new Error("問題が読み込まれていません");
      return db.practiceSessions.add({
        ...search,
        quizIds: quizzes.map((quiz) => quiz.qid),
        currentIndex: 0,
        updatedAt: new Date(),
      });
    },
    enabled: !isResume && quizzes !== undefined,
    staleTime: Infinity,
    gcTime: 0,
  });
  const { data: quizzesSize } = useQuery({
    queryKey: [
      "get",
      "/quizzes/size",
      {
        params: { query: search },
      },
    ],
    queryFn: ({ signal }) =>
      rpc.api.quizzes.size
        .$get({ query: cleanQuery(search) }, { init: { signal: signal } })
        .then(readResponse),
    enabled: shouldFetchNormal,
  });

  const { data: record } = useQuery({
    queryKey: ["practiceSession", resumeId],
    queryFn: async () => {
      if (resumeId === undefined) return null;

      return (await db.practiceSessions.get(resumeId)) ?? null;
    },
    enabled: resumeId !== undefined,
  });

  const { data: resumeQuizzes } = useQuery({
    queryKey: ["get", "/quizzes", "resume", resumeId, record?.quizIds],
    enabled: isResume && !!record && record.quizIds.length > 0,
    queryFn: async ({ signal }) => {
      if (!record) throw new Error("保存データがありません");

      const quizzes = await rpc.api.quizzes["by-ids"]
        .$get(
          {
            query: {
              qids: record.quizIds,
            },
          },
          { init: { signal } },
        )
        .then(readResponse);

      // API の返却順ではなく、保存した出題順に復元する
      const byId = new Map(quizzes.map((quiz) => [quiz.qid, quiz]));

      return record.quizIds.map((id) => {
        const quiz = byId.get(id);
        if (!quiz) throw new Error("再開に必要な問題が見つかりません");
        return quiz;
      });
    },
  });

  const activeQuizzes = isResume ? resumeQuizzes : quizzes;
  const activeSize = isResume
    ? (activeQuizzes?.length ?? 0)
    : (quizzesSize?.size ?? 0);

  // Mount only after the saved position and session ID are available.
  if (
    isResume
      ? !record || !resumeQuizzes
      : shouldFetchNormal && newSessionId === undefined
  ) {
    return null;
  }

  const shuffledList = [...Array(activeQuizzes?.length ?? 0).keys()];

  return (
    <>
      <PracticeSceneChanger
        key={resumeId ?? newSessionId ?? "new"}
        quizzes={activeQuizzes}
        size={activeSize}
        shuffledList={shuffledList}
        initialIndex={record?.currentIndex ?? 0}
        isTransfer={search.isTransfer}
        resumeId={isResume ? resumeId : newSessionId}
        onFilter={() => setShouldFetch(true)}
      />
    </>
  );
}
