import { Element } from "./CreateDashboard";
import PreviewCsvTable from "./PreviewCsvTable";
import { Button, Divider, Group, Modal, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import WorkbookSelector from "./WorkbookSelector";
import { useState } from "react";

interface Props {
  elements: Element[],
  onSave?: (quizzes: Element[], wid: string | null) => void,
  onReload?: () => void,
}

export default function CsvEditor({ 
  elements,
  onSave = () => {}, 
  onReload = () => {},
}: Props) {
  const [ wid, setWid ] = useState<string | null>(null);
  const [ opened, {open, close} ] = useDisclosure(false);

  const ReLoadButton = () => (
    <Button
      variant="outline"
      onClick={() => onReload()}
    >
      再読み込み
    </Button>
  );

  const CancelButton = () => (
    <Button variant="outline" color="red" onClick={close}>
      キャンセル
    </Button>
  );

  const SaveButton = () => (
    <Button
      onClick={() => {
        onSave(elements, wid);
        close();
      }}
    >
      保存
    </Button>
  );

  return (
    <> 
      <WorkbookSelector 
        mb="md"
        value={wid}
        onChange={setWid}
      />

      <Group justify="flex-end" mb="xl">
        <ReLoadButton/>
        <Button onClick={open}>確認</Button>
      </Group>

      <Title order={3}>問題のプレビュー</Title>
      <Divider />
      <PreviewCsvTable elements={elements}/>

      <Modal centered withCloseButton opened={opened} onClose={close} title="インポートの確認">
        <Text pb="md">{elements.length}問をインポートします。よろしいですか？</Text>
        <Group justify="space-between">
          <CancelButton />
          <SaveButton />
        </Group>
      </Modal>
    </>
  );
}
