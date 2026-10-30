import { Judgement } from "@/types";
import HistorySelectButton from "./HistorySelectButton";

interface Props {
  judgements: Judgement[];
  right: number;
  wrong: number;
  throgh: number;
  onSelect: (judgements: Judgement[]) => void;
}

export default function HistorySelectJudgement({
  judgements,
  right,
  wrong,
  throgh,
  onSelect,
}: Props) {
  const setJudgements = (judgement: Judgement) => {
    const include = judgements.includes(judgement);
    if (include) onSelect(judgements.filter((j) => j !== judgement));
    else onSelect([...judgements, judgement]);
  };

  return (
    <>
      <HistorySelectButton
        label="正答"
        color="red"
        count={right}
        isSelect={judgements.includes("right")}
        divide
        onClick={() => setJudgements("right")}
      />
      <HistorySelectButton
        label="誤答"
        color="blue"
        count={wrong}
        isSelect={judgements.includes("wrong")}
        divide
        onClick={() => setJudgements("wrong")}
      />
      <HistorySelectButton
        label="スルー"
        color="gray"
        count={throgh}
        isSelect={judgements.includes("through")}
        onClick={() => setJudgements("through")}
      />
    </>
  );
}
