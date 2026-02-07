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
        isSelect={judgements.includes(1)}
        divide
        onClick={() => setJudgements(1)}
      />
      <HistorySelectButton
        label="誤答"
        color="blue"
        count={wrong}
        isSelect={judgements.includes(0)}
        divide
        onClick={() => setJudgements(0)}
      />
      <HistorySelectButton
        label="スルー"
        color="gray"
        count={throgh}
        isSelect={judgements.includes(2)}
        onClick={() => setJudgements(2)}
      />
    </>
  );
}
