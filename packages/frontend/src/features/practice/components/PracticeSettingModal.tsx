import { Button, Checkbox, Divider, Stack } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useState } from "react";

export function PracticeSettingModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  isContainNA?: boolean;
  onTrain: (judgements: number[]) => void;
}>) {
  const isContainNA =
    innerProps.isContainNA == undefined ? true : innerProps.isContainNA;
  const [judgements, setJudgements] = useState(["0", "1", "2", "3"]);
  const [isShuffle, setIsShuffle] = useState(true);
  return (
    <>
      <Checkbox.Group
        label="問題の種類"
        defaultValue={judgements}
        value={judgements}
        onChange={setJudgements}
      >
        <Stack mt="xs">
          <Checkbox
            defaultChecked
            label="正答した問題"
            color="green"
            value="1"
          />
          <Checkbox defaultChecked label="誤答した問題" color="red" value="0" />
          <Checkbox
            defaultChecked
            label="スルーした問題"
            color="gray"
            value="2"
          />
          {isContainNA && (
            <Checkbox
              defaultChecked
              label="未回答の問題"
              color="black"
              value="3"
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
          innerProps.onTrain(judgements.map((j) => Number(j)));
          context.closeModal(id);
        }}
      >
        演習を開始
      </Button>
    </>
  );
}
