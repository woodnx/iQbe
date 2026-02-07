import { Box, BoxProps, Group, Radio, TextInput } from "@mantine/core";
import { ChangeEvent } from "react";
import { KeywordOption } from "@/types";

type FormInputProps = {
  value?: string;
  onChange?: (value: ChangeEvent<HTMLInputElement>) => void;
};

export type OptionProps = {
  value?: string;
  onChange?: (value: KeywordOption) => void;
};

interface FilteringWordProps extends BoxProps {
  wordInputProps: FormInputProps;
  wordSearchOption: OptionProps;
}

export default function FilteringWord({
  wordInputProps = { value: "", onChange: () => {} },
  wordSearchOption = { value: "", onChange: () => {} },
  className,
  ...others
}: FilteringWordProps) {
  return (
    <Box {...others}>
      <TextInput
        className={className}
        label="キーワードによる絞り込み"
        placeholder="キーワードを入力"
        value={wordInputProps.value}
        onChange={wordInputProps.onChange}
      />
      <Radio.Group
        label="検索範囲"
        value={wordSearchOption.value}
        defaultValue="1"
        onChange={(v) => {
          if (wordSearchOption.onChange && v == "1") {
            wordSearchOption.onChange(Number(v) as 1);
          } else if (wordSearchOption.onChange && v == "2") {
            wordSearchOption.onChange(Number(v) as 2);
          } else if (wordSearchOption.onChange && v == "3") {
            wordSearchOption.onChange(Number(v) as 3);
          }
        }}
      >
        <Group>
          <Radio value="1" label="問題文と解答の両方" />
          <Radio value="2" label="問題文のみ" />
          <Radio value="3" label="解答のみ" />
        </Group>
      </Radio.Group>
    </Box>
  );
}
