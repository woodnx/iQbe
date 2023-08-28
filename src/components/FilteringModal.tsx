import { ActionIcon, Button, DefaultProps, Group, Modal } from "@mantine/core";
import { useState } from "react";
import FilteringWorkbook from "./FilteringWorkbook";
import FilteringLevel from "./FilteringLevel";
import { useInput, useIsMobile } from "../hooks";
import FilteringWord from "./FilteringWord";
import { IconFilter, IconSearch } from "@tabler/icons-react";
import { KeywordOption } from "../types";
import FilteringQuizNumber from "./FilteringQuizNumber";

interface FilteringModalProps extends DefaultProps {
  apply: (
    workbooks?: string[],
    levels?: string[],
    keyword?: string,
    keywordOption?: KeywordOption,
    perPage?: number, 
  ) => void,
  opened: boolean,
  onOpen: () => void,
  onClose: () => void,
};

export default function FilteringModal({
  apply,
  opened,
  onOpen,
  onClose,
  ...others
}: FilteringModalProps) {
  const [ workbooks, setWorkbooks ] = useState<string[]>([]);
  const [ levels, setLevels ] = useState<string[]>([]);
  const [ keywordProps ] = useInput('');
  const [ keywordOption, setkeywordOption ] = useState<KeywordOption>('1')
  const [ perPage, setPerPage ] = useState(100);
  const isMobile = useIsMobile();

  const defaultButton = (
    <Button 
      onClick={onOpen}
      leftIcon={<IconFilter/>}
      variant="outline"
      color="orange"
      { ...others }
    >Filtering</Button>
  );

  const mobileButton = (
    <ActionIcon 
      onClick={onOpen}
      color="orange" 
      size="lg" 
      radius="xl" 
      variant="outline"
    >
      <IconFilter/>
    </ActionIcon>
  )

  return (
    <>
      <Modal 
        opened={opened} 
        onClose={onClose} 
        title="Filtering Quiz"
        size="lg"
        fullScreen={isMobile}
        left={-0.5}
        pos="absolute"
      >
        <FilteringWorkbook
          value={workbooks} 
          onChange={setWorkbooks}
        />
        <FilteringLevel 
          value={levels}
          onChange={setLevels}
          mt="lg"
        />
        <FilteringWord 
          wordInputProps={keywordProps} 
          wordSearchOption={{ 
            value: keywordOption, 
            onChange: setkeywordOption 
          }}
          mt="lg"
        />
        <FilteringQuizNumber
          value={perPage}
          onChange={setPerPage}
          mt="lg"
        />
        <Group mt="xl" position="right">
          <Button 
            leftIcon={<IconSearch/>}
            onClick={() => apply(workbooks, levels, keywordProps.value, keywordOption, perPage)}
          >Search</Button>
        </Group>
      </Modal>
      { isMobile ? mobileButton : defaultButton }
    </>
  );
}