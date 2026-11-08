import { Alert, Button, Group, Loader, Text } from "@mantine/core";

interface Props {
  state: "idle" | "saving" | "failed";
  onRetry: () => void;
}

export function PracticeSaveStatus({ state, onRetry }: Props) {
  if (state === "idle") return null;
  if (state === "saving") {
    return (
      <Group role="status" my="sm">
        <Loader size="sm" />
        <Text>保存しています…</Text>
      </Group>
    );
  }
  return (
    <Alert color="red" title="保存に失敗しました" role="alert" my="sm">
      <Text>
        解答を保持しています。通信状態を確認して、もう一度お試しください。
      </Text>
      <Button mt="sm" onClick={onRetry}>
        もう一度保存する
      </Button>
    </Alert>
  );
}
