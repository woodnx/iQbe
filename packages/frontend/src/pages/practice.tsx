import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PracticeSceneChanger from "@/components/PracticeSceneChanger";
import useQuizSize from "@/hooks/useQuizSize";
import useQuizzes from "@/hooks/useQuizzes";

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
  const [searchParams] = useSearchParams();
  const [shouldFetch, setShouldFetch] = useState(false);
  const path = searchParams.get("path");
  const isTransfer = !!path;

  const { quizzes, params } = useQuizzes(undefined, shouldFetch || isTransfer);
  const { quizzesSize } = useQuizSize(params);
  const shuffledList = useMemo(() => {
    const length = quizzes?.length || 0;
    return isTransfer ? shuffleSequense(length) : [...Array(length).keys()];
  }, [quizzes?.length, isTransfer]);

  return (
    <>
      <PracticeSceneChanger
        quizzes={quizzes}
        size={quizzesSize || 0}
        shuffledList={shuffledList}
        isTransfer={isTransfer}
        onFilter={() => setShouldFetch(true)}
      />
    </>
  );
}
