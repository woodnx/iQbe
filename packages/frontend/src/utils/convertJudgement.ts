import { Judgement } from "@/types";

export const convertJudgement = (j: number): Judgement => {
  if (j < 0) return 0;
  else if (j == 0) return 0;
  else if (j == 1) return 1;
  return 2;
};

export const convertJudgements = (js: number[]): Judgement[] => {
  return js.map((j) => convertJudgement(j));
};
