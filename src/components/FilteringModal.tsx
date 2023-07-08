import { Button, Group, Modal } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useState } from "react"
import FilteringWorkbook from "./FilteringWorkbook"
import FilteringLevel from "./FilteringLevel"
import { useInput, useIsMobile } from "../hooks"
import FilteringWord from "./FilteringWord"
import { IconFilter, IconSearch } from "@tabler/icons-react"
import useQuizzesStore from "../store/quiz"
import { KeywordOption, QuizRequestParams } from "../types"

export type Level = {
  id: number,
  name: string,
  color: string,
}

export default function FilteringModal() {
  const [ opened, { open, close } ] = useDisclosure(true)
  const [ selectedWorkbook, setSelectedWorkbook ] = useState<string[]>([])
  const [ selectedLevel, setSelectedLevel ] = useState<string[]>([])
  const [ keywordProps ] = useInput('')
  const [ keywordOption, setkeywordOption ] = useState<KeywordOption>('1')
  const isMobile = useIsMobile()
  const getQuiz = useQuizzesStore(state => state.getQuiz)

  const filtering = async () => {
    const params: QuizRequestParams = {
      page: 1,
      perPage: 100,
      workbooks: selectedWorkbook,
      levels: selectedLevel,
      keyword: keywordProps.value,
      keywordOption: keywordOption
    }
    close()
    await getQuiz(params)
  }

  return (
    <>
      <Modal 
        opened={opened} 
        onClose={close} 
        title="Filtering Quiz"
        size="lg"
        fullScreen={isMobile}
      >
        <FilteringWorkbook
          value={selectedWorkbook} 
          onChange={setSelectedWorkbook}
        />
        <FilteringLevel 
          value={selectedLevel}
          onChange={setSelectedLevel}
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
        <Group mt="xl" position="right">
          <Button 
            leftIcon={<IconSearch/>}
            onClick={filtering}
          >Search</Button>
        </Group>
      </Modal>
      <Button 
        onClick={open}
        leftIcon={<IconFilter/>}
        variant="outline"
        color="orange"
      >Filtering</Button>
    </>
  )
}