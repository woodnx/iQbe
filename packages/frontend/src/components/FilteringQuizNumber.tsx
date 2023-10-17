import { Slider, SliderProps, Text } from "@mantine/core";

interface Props extends SliderProps {
}

export default function FilteringQuizNumber({
  value,
  onChange,
  ...others
}: Props){
  return (
    <>
      <Text {...others}>表示問題数</Text>
      <Slider 
        label={`${value}問`}
        min={1}
        max={100}
        defaultValue={100}
        value={value}
        onChange={onChange}
      />
    </>
  )
}