import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import PracticeSceneChanger from "@/components/PracticeSceneChanger";
import useQuizzes, { QuizzesPath } from "@/hooks/useQuizzes";

function shuffleSequense(n: number) {
  const a = [ ...Array(n).keys() ];

  for(let i = a.length -1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }

  return a;
}

const isQuizzesPath = (path?: string | null): path is QuizzesPath => {
  if (path == '/') return true;
  else if (path == '/favorite') return true;
  else if (path == '/history') return true;
  return false
}

const toQuizzesPath = (path: string): QuizzesPath => {
  return isQuizzesPath(path) ? path : ''
}

export default function Practice() {
  const [ searchParams ] = useSearchParams();
  const [ shouldFetch, setShouldFetch ] = useState(false);
  const paramPath = searchParams.get('path');
  const path = toQuizzesPath(paramPath || '');
  const isTransfer = !!path;

  const { quizzes } = useQuizzes(isTransfer ? path : undefined, undefined, shouldFetch || isTransfer);
  const shuffledList = isTransfer ? shuffleSequense(quizzes?.length || 0) : [...Array(quizzes?.length || 0).keys()];

  return (
    <>
      <PracticeSceneChanger
        quizzes={quizzes}
        shuffledList={shuffledList}
        isTransfer={isTransfer}
        onFilter={() => setShouldFetch(true)}
      />
    </>
  )
}