import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";
import PracticeSceneChanger from "@/features/practice/components/PracticeSceneChanger";
import { cleanQuery, readResponse, rpc } from "@/utils/client";
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
  }),
});

function RouteComponent() {
  const [shouldFetch, setShouldFetch] = useState(false);
  const search = useSearch({ from: "/practice" });
  const { data: quizzes } = useQuery({
    queryKey: [
      "get",
      "/quizzes",
      {
        params: { query: search },
      },
    ],
    queryFn: ({ signal }) =>
      rpc.api.quizzes
        .$get({ query: cleanQuery(search) }, { init: { signal: signal } })
        .then(readResponse),
    enabled: shouldFetch || search.isTransfer === true || search.seed != null,
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
    enabled: shouldFetch || search.isTransfer === true || search.seed != null,
  });
  const shuffledList = [...Array(quizzes?.length ?? 0).keys()];

  return (
    <>
      <PracticeSceneChanger
        quizzes={quizzes}
        size={quizzesSize?.size || 0}
        shuffledList={shuffledList}
        isTransfer={search.isTransfer}
        onFilter={() => setShouldFetch(true)}
      />
    </>
  );
}
