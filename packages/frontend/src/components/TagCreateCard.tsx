import { Card } from "@mantine/core";
import TagEditForm from "./TagEditForm";
import TagBadge from "./TagBadge";
import { useState } from "react";

export interface TagCreateCardProps {
  defaultColor: string,
  onCreate?: (
    label: string, 
    description: string, 
    color: string
  ) => void,
  onCancel?: () => void,
}

export default function TagCreateCard({
  defaultColor,
  onCreate = () => {},
  onCancel = () => {}
}: TagCreateCardProps) {
  const [ label, setLabel ] = useState('');
  const [ color, setColor ] = useState(defaultColor);

  const reset = () => {
    setLabel('');
    setColor(defaultColor);
    onCancel();
  };

  return (
    <Card withBorder>
      <TagBadge 
        label={label || 'tag preview' }
        color={color}
      />
      <TagEditForm 
        label={label}
        description=""
        color={color}
        buttonLabel="作成"
        onChangeLabel={setLabel}
        onChangeColor={setColor}
        onCancel={reset}
        onSave={onCreate}
      />
    </Card>
  )
}