import { Select, SelectProps } from "@mantine/core";
import { useWorkbooks } from "@/hooks/useWorkbooks";

interface Props extends SelectProps {
  value?: string | null,
  onChange?: (value: string | null) => void,
}

export default function WorkbookSelector({
  value,
  onChange = () => {},
  ...others
}: Props) {
  const { workbooks } = useWorkbooks();
  const data = workbooks?.map(w => ({ ...w, value: w.wid, label: w.name}));

  return (
    <Select
      clearable
      placeholder="問題集を選択"
      data={data}
      value={value}
      onChange={(v) => onChange(v)}
      {...others}
    />
  );
}