import { ActionIcon, BoxProps, Card, Collapse, Group, Text } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import TagBadge from "./TagBadge";
import { useDisclosure } from "@mantine/hooks";
import TagEditForm from "./TagEditForm";
import { useState } from "react";
import { $api } from "@/utils/client";

export interface TagCardProps extends BoxProps {
  tid: string,
  label: string,
  description: string,
  color: string,
}

export default function TagCard({
  tid,
  label: initialLabel,
  description: initialDescription,
  color: initialColor,
  ...others
}: TagCardProps) {
  const [ opened, { toggle } ] = useDisclosure();
  const [ label, setLabel ] = useState(initialLabel);
  const [ description, setDescription ] = useState(initialDescription)
  const [ color, setColor ] = useState(initialColor);
  const { mutate } = $api.useMutation('put', '/tags');

  const reset = () => {
    setLabel(initialLabel);
    setDescription(initialDescription);
    setColor(initialColor);
    toggle();
  };

  return (
    <Card 
      withBorder
      radius="md"
      padding="xs" 
      {...others}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group>
          <TagBadge
            label={label}
            color={color}
          />
          <Text size="sm" c="gray" lineClamp={1}>
            { description }
          </Text>
        </Group>
        <ActionIcon 
          variant="transparent"
          color="gray"
          onClick={() => {
            if (opened) reset();
            else toggle();
          }}
        >
          <IconPencil />
        </ActionIcon>
      </Group>
      <Collapse in={opened}>
        <TagEditForm
          mt="sm"
          label={label}
          description={description}
          color={color}
          onChangeLabel={setLabel}
          onChangeDescription={setDescription}
          onChangeColor={setColor}
          onCancel={reset}
          onSave={(label, description, color) => {
            mutate({ body: {
              tid,
              label,
              description,
              color,
            }})
            toggle();
          }}
        />
      </Collapse>
    </Card>
  )
}