import {
  Affix,
  Alert,
  Button,
  Group,
  Loader,
  Paper,
  Text,
} from "@mantine/core";

interface Props {
  state: "idle" | "saving" | "failed";
  onRetry: () => void;
}

export function PracticeSaveStatus({ state, onRetry }: Props) {
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
