import { DefaultProps, Group, Radio, TextInput } from "@mantine/core"
import { formInputProps } from "../hooks"
import { KeywordOption } from "../types"

export type optionProps = {
  value: string,
  onChange: (value: KeywordOption) => void
}

interface FilteringWordProps extends DefaultProps {
  wordInputProps: formInputProps,
  wordSearchOption: optionProps,
}

export default function FilteringWord({ 
  wordInputProps, 
  wordSearchOption,
  className,
  ...others
}: FilteringWordProps) {
  return (
    <>
      <TextInput
        className={className}
        label="Word Search"
        {...wordInputProps}
        {...others}
      />
      <Radio.Group 
        mt="sm"
        label="Search Option"
        {...wordSearchOption}
      >
        <Group>
          <Radio 
            value="1"
            label="問題文と解答の両方"
          />
          <Radio 
            value="2"
            label="問題文のみ"
          />
          <Radio 
            value="3"
            label="解答のみ"
          />
        </Group>
        
      </Radio.Group>
    </>
  )
}