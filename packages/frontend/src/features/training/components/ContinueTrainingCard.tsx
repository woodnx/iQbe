import dayjs from "@/plugins/dayjs";
import { db } from "@/plugins/db";
import { Box, Button, Card, Center, Loader, Text } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import classes from "./ContinueTrainingCard.module.css";

export function ContinueTrainingCard() {
  const navigate = useNavigate();
  const record = useLiveQuery(
    async () =>
      (await db.practiceSessions
        .orderBy("updatedAt")
        .reverse()
        .filter((session) => session.currentIndex < session.quizIds.length)
        .first()) ?? null,
  );
  const resumeStatus =
    record &&
    `中断した演習があります（最終演習日：${dayjs(record.updatedAt).format("YYYY/MM/DD")}）`;

  const isLoading = record === undefined;

  return (
    <Card padding="lg" radius="lg">
      <div>
        <Text fw={700} size="xl">
          前回の続き
        </Text>
        <Box mt="xs" mih={24}>
          {isLoading ? (
            <Center mih={24} className={classes.delayedLoader}>
              <Loader size="xs" type="dots" />
            </Center>
          ) : (
            <Text c="dimmed" size="sm">
              {resumeStatus || "中断した演習はありません"}
            </Text>
          )}
        </Box>
        <Button
          color="green"
          fullWidth
          mt="md"
          radius="md"
          variant="filled"
          disabled={!record}
          onClick={() => {
            if (!record) return;

            navigate({
              to: "/practice",
              search: { resumeId: record.id, isTransfer: true },
            });
          }}
        >
          演習を再開
        </Button>
      </div>
    </Card>
  );
}
