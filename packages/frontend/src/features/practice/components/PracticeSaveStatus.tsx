import {
  Affix,
  Alert,
  Button,
  Group,
  Loader,
  Paper,
  Text,
} from "@mantine/core";
import {
  REJECTION_MESSAGES,
  type RejectedStatus,
} from "../practiceSaveRejection";

interface Props {
  state: "idle" | "saving" | "failed" | "rejected";
  rejectedStatus?: RejectedStatus | null;
  onRetry: () => void;
  onDiscard?: () => void;
}

export function PracticeSaveStatus({
  state,
  rejectedStatus = null,
  onRetry,
  onDiscard,
}: Props) {
  if (state === "idle") return null;
  return (
    <Affix
      position={{
        bottom: "calc(16px + env(safe-area-inset-bottom))",
        right: 16,
      }}
      maw="min(420px, calc(100vw - 32px))"
    >
      {state === "saving" ? (
        <Paper shadow="md" p="sm" withBorder>
          <Group role="status">
            <Loader size="sm" />
            <Text>保存しています…</Text>
          </Group>
        </Paper>
      ) : state === "rejected" && rejectedStatus !== null ? (
        <Alert
          color="red"
          title={REJECTION_MESSAGES[rejectedStatus].title}
          role="alert"
        >
          <Text>{REJECTION_MESSAGES[rejectedStatus].message}</Text>
          <Button mt="sm" onClick={onDiscard}>
            {rejectedStatus === 401
              ? "ログインし直す"
              : "この解答を破棄して続ける"}
          </Button>
        </Alert>
      ) : (
        <Alert color="red" title="保存に失敗しました" role="alert">
          <Text>
            解答を保持しています。通信状態を確認して、もう一度お試しください。
          </Text>
          <Button mt="sm" onClick={onRetry}>
            もう一度保存する
          </Button>
        </Alert>
      )}
    </Affix>
  );
}
