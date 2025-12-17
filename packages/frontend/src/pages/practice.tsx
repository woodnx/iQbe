import { useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import PracticeSceneChanger from "@/components/PracticeSceneChanger";
import { $api } from "@/utils/client";

function shuffleSequense(n: number) {
  const a = [...Array(n).keys()];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }

  return a;
}

export default function Practice() {
  const [shouldFetch, setShouldFetch] = useState(false);
  const search = useSearch({ from: "/practice" });
  const { data: quizzes } = $api.useQuery("get", "/quizzes", {
    params: { query: search },
    enabled: shouldFetch,
  });
  const { data: quizzesSize } = $api.useQuery("get", "/quizzes/size", {
    params: { query: search },
    enabled: shouldFetch,
  });
  const shuffledList = useMemo(() => {
    const length = quizzes?.length || 0;
    return search.isTransfer
      ? shuffleSequense(length)
      : [...Array(length).keys()];
  }, [quizzes?.length, search.isTransfer]);

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
