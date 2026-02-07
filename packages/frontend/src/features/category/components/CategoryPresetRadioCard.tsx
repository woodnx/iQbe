import { Badge, Group, Radio, Text } from "@mantine/core";

import classes from "./styles/CategoryPresetRadioCard.module.css";

interface CategoryPresetRadioCardProps {
  value: string;
  name: string;
  description: string;
  tag?: string;
}

const CategoryPresetRadioCard = ({
  value,
  name,
  tag,
  description,
}: CategoryPresetRadioCardProps) => {
  return (
    <Radio.Card p="sm" radius="md" value={value}>
      <Group wrap="nowrap" align="flex-start">
        <Radio.Indicator />
        <div>
          <Group>
            <Text className={classes.label}>{name}</Text>
            {tag && <Badge variant="light">{tag}</Badge>}
          </Group>
          <Text className={classes.description}>{description}</Text>
        </div>
      </Group>
    </Radio.Card>
  );
};

export default CategoryPresetRadioCard;
