import { Button, Checkbox, Divider, Stack } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useState } from "react";
import { judgementSchema, type Judgement } from "@/utils/quizFilters";

export function PracticeSettingModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  isContainNA?: boolean;
  onTrain: (judgements: Judgement[]) => void;
}>) {
  const isContainNA =
    innerProps.isContainNA == undefined ? true : innerProps.isContainNA;
  const [judgements, setJudgements] = useState<Judgement[]>(
    isContainNA
      ? ["wrong", "right", "through", "unanswered"]
      : ["wrong", "right", "through"],
  );
  const [isShuffle, setIsShuffle] = useState(true);
  return (
    <>
      <Checkbox.Group
        label="問題の種類"
        defaultValue={judgements}
        value={judgements}
        onChange={(values) =>
          setJudgements(values.map((value) => judgementSchema.parse(value)))
        }
      >
        <Stack mt="xs">
          <Checkbox
            defaultChecked
            label="正答した問題"
            color="green"
            value="right"
          />
          <Checkbox
            defaultChecked
            label="誤答した問題"
            color="red"
            value="wrong"
          />
          <Checkbox
            defaultChecked
            label="スルーした問題"
            color="gray"
            value="through"
          />
          {isContainNA && (
            <Checkbox
              defaultChecked
              label="未回答の問題"
              color="black"
              value="unanswered"
            />
          )}
        </Stack>
      </Checkbox.Group>
      <Divider my="md" />
      <Checkbox
        defaultChecked
        label="シャッフル"
        checked={isShuffle}
        onChange={(event) => setIsShuffle(event.currentTarget.checked)}
      />
      <Button
        color="green"
        mt="md"
        radius="md"
        variant="filled"
        fullWidth
        onClick={() => {
          innerProps.onTrain(judgements);
          context.closeModal(id);
        }}
      >
        演習を開始
      </Button>
    </>
  );
}
