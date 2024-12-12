import { BoxProps, Group, Radio, RadioGroup } from '@mantine/core';

interface FilteringTagMatchAllProps extends BoxProps {
  value?: boolean,
  onChange?: (value: boolean) => void
}

export default function FilteringTagMatchAll({
  value,
  onChange = () => {},
  ...others
}: FilteringTagMatchAllProps) {
  const matchAll = value ? 'and' : 'or';

  return (
    <RadioGroup
      name="tagMatchAll"
      label="タグの検索オプション"
      value={matchAll}
      onChange={(value) => {
        const v = value == 'and' ? true : false;
        onChange(v);
      }}
      {...others}
    >
      <Group>
        <Radio value="or" label="OR検索"/>
        <Radio value="and" label="AND検索"/>
      </Group>
    </RadioGroup>
  )
}