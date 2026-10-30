import { Button, Card, Text } from "@mantine/core";
import classes from "./TrainingNavigationCard.module.css";

type Props = {
  title: string;
};

export function TrainingNavigationCard({ title }: Props) {
  return (
    <Card
      className={classes.trainingCard}
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
    >
      <svg
        className={classes.wave}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <path
            id="gentle-wave-training"
            d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z"
          />
        </defs>
        <g className={classes.parallax}>
          <use
            href="#gentle-wave-training"
            x="48"
            y="0"
            fill="rgba(127, 29, 29, 0.22)"
          />
        </g>
      </svg>

      <div className={classes.content}>
        <Text fw={700} size="xl" c="red.9">
          {title}
        </Text>

        <Text size="sm" c="red.8" mt="xs">
          前回の学習内容から再開できます
        </Text>

        <Button
          color="red"
          fullWidth
          mt="md"
          radius="md"
          variant="filled"
          size="md"
        >
          つづきから始める
        </Button>
      </div>
    </Card>
  );
}
