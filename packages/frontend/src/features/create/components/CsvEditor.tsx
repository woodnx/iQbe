import {
  Alert,
  Button,
  Divider,
  Group,
  Modal,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRef, useState } from "react";
import WorkbookCreateAndSelector from "@/features/workbook/components/WorkbookCreateAndSelector";
import { useCategories } from "@/hooks/useCategories";
import type { Element } from "@/routes/create";
import PreviewCsvTable from "./PreviewCsvTable";

interface Props {
  elements: Element[];
  onChange: (elements: Element[]) => void;
  onSave: (quizzes: Element[], wid: string | null) => Promise<void>;
  onReload: () => void;
}

export default function CsvEditor({
  elements,
  onChange,
  onSave,
  onReload,
}: Props) {
  const [wid, setWid] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [isSaving, setIsSaving] = useState(false);
  const saving = useRef(false);
  const [saveError, setSaveError] = useState<string>();
  const { categories, isLoading, error } = useCategories();
  const unresolved = elements.filter((element) => element.categoryError).length;
  const cannotSave = unresolved > 0 || isSaving;

  const save = async () => {
    if (cannotSave || saving.current) return;
    saving.current = true;
    setIsSaving(true);
    setSaveError(undefined);
    try {
      await onSave(elements, wid);
      close();
      onReload();
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "保存に失敗しました。もう一度お試しください。",
      );
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  return (
    <>
      <WorkbookCreateAndSelector
        mb="md"
        value={wid}
        onChange={setWid}
        disabled={isSaving}
      />
      <Text size="sm" mb="md">
        ジャンルは行ごとに選び直せます。登録しない場合は「ジャンルなしにする」を選んでください。
      </Text>
      {unresolved > 0 && (
        <Alert color="orange" mb="md">
          {unresolved}
          件のジャンルを修正してください。すべて修正すると保存できます。
        </Alert>
      )}
      {error && (
        <Alert color="red" mb="md">
          ジャンル一覧を取得できませんでした。時間をおいて再度読み込んでください。
        </Alert>
      )}
      <Group justify="flex-end" mb="xl">
        <Button variant="outline" disabled={isSaving} onClick={onReload}>
          再読み込み
        </Button>
        <Button
          disabled={cannotSave}
          onClick={() => {
            if (!cannotSave) open();
          }}
        >
          確認
        </Button>
      </Group>
      <Title order={3}>問題のプレビュー</Title>
      <Divider />
      <PreviewCsvTable
        elements={elements}
        categories={categories ?? []}
        onChange={onChange}
        disabled={isSaving || isLoading || !!error}
      />
      <Modal
        centered
        withCloseButton={!isSaving}
        closeOnClickOutside={!isSaving}
        closeOnEscape={!isSaving}
        opened={opened}
        onClose={() => {
          if (!isSaving) close();
        }}
        title="インポートの確認"
      >
        <Text pb="md">
          {elements.length}問をインポートします。よろしいですか？
        </Text>
        {saveError && (
          <Alert color="red" mb="md">
            {saveError}
          </Alert>
        )}
        <Group justify="space-between">
          <Button
            variant="outline"
            color="red"
            disabled={isSaving}
            onClick={close}
          >
            キャンセル
          </Button>
          <Button disabled={cannotSave} loading={isSaving} onClick={save}>
            保存
          </Button>
        </Group>
      </Modal>
    </>
  );
}
