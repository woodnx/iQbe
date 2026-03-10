import { Stack, Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { TrainingNavigationCard } from "@/features/training/TrainingNavigationCard";

export const Route = createFileRoute("/training")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Stack>
        <TrainingNavigationCard title="前回の続き" />
        <TrainingNavigationCard title="今日の復習" />
      </Stack>
      <Text>最近学習したセット</Text>
      <Stack>
        <TrainingNavigationCard title="前回の続き" />
        <TrainingNavigationCard title="今日の復習" />
      </Stack>
    </>
  );
}
