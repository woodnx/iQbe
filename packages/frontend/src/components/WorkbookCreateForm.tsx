import { Button, Group, ModalProps, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useInputState } from "@mantine/hooks";
import { useState } from "react";

interface Props extends ModalProps {
  onCreate?: (name: string, published: Date | null) => void,
}

export default function WorkbookCreateForm({
  onCreate = () => {},
}: Props) {
  const [ name, setName ] = useInputState('');
  const [ published, setPublished ] = useState<Date | null>(null);

  const create = () => {
    onCreate(name, published);
    setName('');
  };

  return (
    <>
      <TextInput 
        label="問題集の名前"
        value={name} 
        onChange={setName}
      />
      <DateInput 
        clearable
        valueFormat="YYYY/MM/DD"
        label="問題集の発行年月日"
        decadeLabelFormat="YYYY年"
        yearLabelFormat="YYYY年"
        monthLabelFormat="YYYY年 MMMM"
        value={published}
        onChange={setPublished}
      />
      <Group mt="xl" justify="right">
        <Button
          onClick={create}
        >新規作成</Button>
      </Group>
    </>
  )
}